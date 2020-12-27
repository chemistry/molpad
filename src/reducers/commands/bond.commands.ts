import {
    JMolAtomWrap,
    JMolBondWrap,
    JMolWrapModel,
    MOUSE_DOWN,
    MOUSE_LEAVE,
    MOUSE_MOVE,
    MOUSE_UP,
    Reducer,
    StoreState,
    Vec2,
} from "../../declarations";
import {
    CameraHelperService,
    HisoryHelperService,
    MoleculeCalcsHelper,
    MoleculeHelperService,
    ProjectionHelperService,
} from "../../services";

const cloneDeep = require("lodash.clonedeep");

export interface CursorBondData {
    isAtom2Created: boolean;
    bondId: string;
    startAtom: JMolAtomWrap;
}

export const bondCommandsReducer: Reducer<StoreState> = (
    state,
    action,
) => {

    switch (action.type) {

        case MOUSE_DOWN:
            if (shouldProcessIncreaseBond(state)) {
                return increaseBondOrder(state);
            }

            return proposeNewBond(state);

        case MOUSE_MOVE:
            if ((state.cursor.data as CursorBondData).bondId) {
                return updateBond(state);
            }
            return state;

        case MOUSE_UP:
        case MOUSE_LEAVE:
            const newState = incrementBondDublicates(state);
            return replaceCursorData(newState, null);

        default:
          return state;
    }
};

function increaseBondOrder(state: StoreState): StoreState {
    const position =  state.cursor.mouseBegin;
    const camera = state.data.camera;
    const molecule = state.data.molecule;

    const selectedBond = ProjectionHelperService.getProjectionBond({
        position, camera, molecule,
    });

    if (selectedBond) {
        let newState = HisoryHelperService.saveRecoveryPoint(state) as StoreState;
        const toolBondOrder = Number(state.toolbar.type);
        const newBond =  incrementBondValency(selectedBond, toolBondOrder);
        const newMolecule = replaceBond(newState.data.molecule, newBond);
        newState = replaceMolecule(newState, newMolecule);
        newState = replaceCursorData(newState, null);
        return newState;
    }

    return state;
}

function shouldProcessIncreaseBond(state: StoreState): boolean {
    const position =  state.cursor.mouseBegin;
    const camera = state.data.camera;
    const molecule = state.data.molecule;

    const selectedAtom = ProjectionHelperService.getProjectionAtom({
        position, camera, molecule,
    });
    if (selectedAtom) {
        return false;
    }
    return !!ProjectionHelperService.getProjectionBond({
        position, camera, molecule,
    });
}

function proposeNewBond(state: StoreState) {
    const molecule = state.data.molecule;
    const camera = state.data.camera;
    const unproject = CameraHelperService.unproject.bind(null, camera);
    const project = CameraHelperService.project.bind(null, camera);
    const beginPos = state.cursor.mouseBegin;
    const toolBondOrder = Number(state.toolbar.type);

    let startAtom = ProjectionHelperService.getProjectionAtom({
        position: beginPos,
        camera,
        molecule,
    });

    const newMolecule: JMolWrapModel = cloneDeep(molecule);
    const atomCoords = unproject(beginPos);

    if (!startAtom) {
        startAtom = MoleculeHelperService.createAtom({
          ...atomCoords, z: 0, type: "C",
        });
        newMolecule.atoms[startAtom.id] = startAtom;
    }

    const newCursorData: CursorBondData = {
        isAtom2Created: false,
        bondId: "",
        startAtom,
    };

    const endAtomData = MoleculeCalcsHelper.proposeEndAtom(startAtom, state);
    const endAtomViewPos = project(endAtomData);
    let endAtom = ProjectionHelperService.getProjectionAtom({
        position: endAtomViewPos,
        camera,
        molecule,
    });
    if (!endAtom) {
        endAtom = MoleculeHelperService.createAtom(endAtomData);
        newCursorData.isAtom2Created = true;
    }

    newMolecule.atoms[endAtom.id] = endAtom;

    const bond = MoleculeHelperService.createBond(startAtom, endAtom, toolBondOrder);
    newMolecule.bonds[bond.id] = bond;
    newCursorData.bondId = bond.id;

    let newState = HisoryHelperService.saveRecoveryPoint(state) as StoreState;
    newState = replaceMolecule(newState, newMolecule);
    newState = replaceCursorData(newState, newCursorData);

    return newState;
}

function updateBond(state: StoreState) {
    const currentPos = state.cursor.mouseCurrent;
    const beginPos = state.cursor.mouseBegin;
    const dx = currentPos.x - beginPos.x;
    const dy = currentPos.y - beginPos.y;
    const l = Math.sqrt(dx * dx + dy * dy);
    if (l < 10) {
        return state;
    }

    const unproject = CameraHelperService.unproject.bind(null, state.data.camera);
    const project = CameraHelperService.project.bind(null, state.data.camera);
    const cursorData = state.cursor.data as CursorBondData;
    const currentBond = cursorData.bondId;
    const newMolecule = cloneDeep(state.data.molecule) as JMolWrapModel;
    const bondToModify = newMolecule.bonds[currentBond];

    const atom2Id = bondToModify.atom2;
    const atom1Id = bondToModify.atom1;

    const hoveredAtoms = ProjectionHelperService.getProjectionAtoms({
        position: currentPos,
        camera: state.data.camera,
        molecule: state.data.molecule,
        multR: 1.5,
    })
    .filter((atom) => {
        return !(
            atom.id === atom1Id || (
              cursorData.isAtom2Created &&
              atom.id === atom2Id
            )
        );
    });

    if (hoveredAtoms.length !== 0) {

        if (cursorData.isAtom2Created) {
            const stickedAtom = hoveredAtoms[0];

            delete newMolecule.atoms[atom2Id];
            bondToModify.atom2 = stickedAtom.id;

            const newState = replaceMolecule(state, newMolecule);

            return replaceCursorData(newState, {
               ...cursorData,
               isAtom2Created: false,
            });
        } else {
            return state;
        }

    } else {

        const newCoords = MoleculeCalcsHelper.proposeFixedAtom(
            cursorData.startAtom, unproject(currentPos),
        );

        const proposedAtomHovering = ProjectionHelperService.getProjectionAtoms({
            position: project(newCoords),
            camera: state.data.camera,
            molecule: state.data.molecule,
            multR: 1.5,
        }).filter((atom) => {
            return !( atom.id === atom1Id || (
                  cursorData.isAtom2Created &&
                  atom.id === atom2Id
                )
            );
        });

        if (cursorData.isAtom2Created) {
            if (proposedAtomHovering.length === 0) {
                const atomToModify = newMolecule.atoms[atom2Id];
                atomToModify.x = newCoords.x;
                atomToModify.y = newCoords.y;

                return replaceMolecule(state, newMolecule);
            } else {
                const proposedStickedAtom = proposedAtomHovering[0];

                delete newMolecule.atoms[atom2Id];
                bondToModify.atom2 = proposedStickedAtom.id;

                const newState = replaceMolecule(state, newMolecule);

                return replaceCursorData(newState, {
                   ...cursorData,
                   isAtom2Created: false,
                });
            }
        } else {
            if (proposedAtomHovering.length === 0) {
                const atom = MoleculeHelperService.createAtom({
                    ...newCoords, z: 0, type: "C",
                });
                newMolecule.atoms[atom.id] = atom;
                bondToModify.atom2 = atom.id;

                const newState = replaceMolecule(state, newMolecule);
                return replaceCursorData(newState, {
                   ...cursorData,
                   isAtom2Created: true,
                });
            } else {
                const proposedStickedAtom = proposedAtomHovering[0];

                const atomToModify = newMolecule.atoms[atom2Id];
                atomToModify.x = proposedStickedAtom.x;
                atomToModify.y = proposedStickedAtom.y;

                return replaceMolecule(state, newMolecule);
            }
        }
    }
}

function incrementBondValency(bond: JMolBondWrap, bondOrder: number): JMolBondWrap {
    const newBond: JMolBondWrap = cloneDeep(bond);
    if (bondOrder === 2 || bondOrder === 3) {
        newBond.order = bondOrder;
        return newBond;
    }

    if (newBond.order >= 3) {
        newBond.order = 1;
    } else {
        newBond.order ++;
    }
    return newBond;
}

function replaceBond(
    molecule: JMolWrapModel, bond: JMolBondWrap,
): JMolWrapModel {
    return {
        ...molecule,
        bonds: {
            ...molecule.bonds,
            [bond.id]: bond,
        },
    };
}

function incrementBondDublicates(state: StoreState): StoreState {
    if (!state.cursor.data) {
        return state;
    }
    const data = (state.cursor.data as CursorBondData);
    const createdBondId = data.bondId;
    const molecule = state.data.molecule;
    const bonds = state.data.molecule.bonds;
    const createdBond = bonds[createdBondId];
    const atom1 = createdBond.atom1;
    const atom2 = createdBond.atom2;

    const bondDublicate = Object.keys(bonds)
      .filter((bondId) => bondId !== createdBondId)
      .map(((bondId) => bonds[bondId]))
      .find((bond) => {
          return ((
              bond.atom1 === atom1 &&
              bond.atom2 === atom2
          ) || (
              bond.atom1 === atom2 &&
              bond.atom2 === atom1
          ));
      });
    if (!bondDublicate) {
        return state;
    }
    let newMolecule = cloneDeep(state.data.molecule) as JMolWrapModel;
    delete newMolecule.bonds[createdBondId];

    const newBond =  incrementBondValency(bondDublicate, 1);
    newMolecule = replaceBond(newMolecule, newBond);

    return replaceMolecule(state, newMolecule);
}

function replaceCursorData(state: StoreState, data: CursorBondData|null): StoreState {
    return {
        ...state,
        cursor: {
            ...state.cursor,
            data,
        },
    };
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
