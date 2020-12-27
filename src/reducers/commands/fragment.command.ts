import {
    JMol,
    JMolAtomWrap,
    JMolBondWrap,
    JMolWrapModel,
    MOUSE_DOWN,
    Reducer,
    StoreState,
} from "../../declarations";
import {
    CameraHelperService,
    HisoryHelperService,
    MoleculeHelperService,
    ProjectionHelperService,
    TemplatesHelperService,
} from "../../services";

import { Molecule } from "@chemistry/molecule";
const cloneDeep = require("lodash.clonedeep");

export const fragmentCommandsReducer: Reducer<StoreState> = (
    state,
    action,
) => {
    switch (action.type) {
        case MOUSE_DOWN:
            const templateId = state.toolbar.type;
            const template = TemplatesHelperService.getTemplateById(templateId) as JMol;
            const position  = action.payload;
            const camera  = state.data.camera;
            const molecule = state.data.molecule;

            const newState = HisoryHelperService.saveRecoveryPoint(state) as StoreState;

            const projectionBond = ProjectionHelperService.getProjectionBond({
                position, camera, molecule,
            });
            if (projectionBond) {
                return applyTemplateToBond(newState, template, projectionBond);
            }
            const projectionAtom = ProjectionHelperService.getProjectionAtom({
                position, camera, molecule,
            });
            if (projectionAtom) {
                return applyTemplateToAtom(newState, template);
            }
            return applyTemplate(newState, template);

      default:
        return state;
    }
};

function applyTemplateToBond(state: StoreState, template: JMol, bond: JMolBondWrap): StoreState {
    const molecule = state.data.molecule;
    const camera = state.data.camera;
    const unproject = CameraHelperService.unproject.bind(null, camera);
    const beginPos = state.cursor.mouseBegin;

    let bAtom1 = molecule.atoms[bond.atom1];
    let bAtom2 = molecule.atoms[bond.atom2];
    let bView = 0;
    try {
        const mol = new Molecule();
        mol.load(molecule, "jnmol");
        const bViews = mol.getBondsViewClasification();
        bView = bViews[bond.id] || 0;
    } catch (e) {
        bView  = 0;
    }
    bView = ((template as any).order || 1) * bView;

    if (bView < 0) {
        const cAtom = bAtom1;
        bAtom1 = bAtom2;
        bAtom2 = cAtom;
    }

    const templateToApply = TemplatesHelperService.adjustToBond({
        template,
        atom1: bAtom2,
        atom2: bAtom1,
        order: bond.order,
    });

    return applyJMolAndMergeAtoms(state, templateToApply);
}

function applyTemplateToAtom(state: StoreState, template: JMol): StoreState {
    return state;
}

function applyTemplate(state: StoreState, template: JMol): StoreState {
    const molecule = state.data.molecule;
    const camera = state.data.camera;
    const unproject = CameraHelperService.unproject.bind(null, camera);
    const beginPos = state.cursor.mouseBegin;

    const center = unproject(beginPos);

    const templateToApply = TemplatesHelperService.shiftTemplate(template, center);

    return applyJMolAndMergeAtoms(state, templateToApply);
}

function applyJMolAndMergeAtoms(state: StoreState, template: JMol) {
    const molecule = state.data.molecule;
    const camera = state.data.camera;
    const MoleculeToApply = MoleculeHelperService.wrapMolecule(template);
    const project = CameraHelperService.project.bind(null, camera);

    const atomsReplacementList = {};
    let atomShift = { x: 0, y: 0 };

    Object.keys(MoleculeToApply.atoms).forEach((atomId) => {
        const atom = MoleculeToApply.atoms[atomId];
        const atomPos = project({x: atom.x, y: atom.y });
        const projectionAtom = ProjectionHelperService.getProjectionAtom({
            position: atomPos, camera, molecule,
        });
        if (projectionAtom) {
            atomsReplacementList[atomId] = projectionAtom.id;

            atomShift.x = atomShift.x + (projectionAtom.x - atom.x);
            atomShift.y = atomShift.y + (projectionAtom.y - atom.y);
        }
    });
    const atomsToMerge = Object.keys(atomsReplacementList).length;
    if (atomsToMerge !== 0) {
        atomShift = {
            x: atomShift.x / atomsToMerge,
            y: atomShift.y / atomsToMerge,
        };
    }

    Object.keys(MoleculeToApply.atoms).forEach((atomId) => {
        const atom = MoleculeToApply.atoms[atomId];
        atom.x = atom.x + atomShift.x;
        atom.y = atom.y + atomShift.y;

        if (atomsReplacementList[atomId]) {
            delete MoleculeToApply.atoms[atomId];
        }
    });

    Object.keys(MoleculeToApply.bonds).forEach((bondId) => {
        const bond = MoleculeToApply.bonds[bondId];
        const atom1Id = bond.atom1;
        const atom2Id = bond.atom2;
        const atom1ToReplace = atomsReplacementList[atom1Id];
        const atom2ToReplace = atomsReplacementList[atom2Id];

        if (
            atom1ToReplace &&
            atom2ToReplace &&
            isConneted(atom1ToReplace, atom2ToReplace, molecule)
        ) {
            delete MoleculeToApply.bonds[bondId];
        } else {
            if (atom1ToReplace) {
                bond.atom1 = atom1ToReplace;
            }
            if (atom2ToReplace) {
                bond.atom2 = atom2ToReplace;
            }
        }
    });

    const newMolecule = {
        ...molecule,
        atoms: {
            ...molecule.atoms,
            ...MoleculeToApply.atoms,
        },
        bonds: {
          ...molecule.bonds,
          ...MoleculeToApply.bonds,
        },
    };

    return replaceMolecule(state, newMolecule);
}

function isConneted(atom1Id: string, atom2Id: string, molecule: JMolWrapModel): boolean {
    return Object.keys(molecule.bonds).some((bondId) => {
        const bond = molecule.bonds[bondId];
        return ((
            bond.atom1 === atom1Id &&
            bond.atom2 === atom2Id
          ) || (
            bond.atom1 === atom2Id &&
            bond.atom2 === atom1Id
        ));
    });
}

function replaceMolecule(state: StoreState, newMolecule: JMolWrapModel): StoreState {
    return {
        ...state,
        data: {
            ...state.data,
            molecule: newMolecule,
        },
    };
}
