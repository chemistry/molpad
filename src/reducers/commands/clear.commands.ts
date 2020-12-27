import {
    JMolAtomWrap,
    JMolBondWrap,
    JMolWrapModel,
    MOUSE_DOWN,
    Reducer,
    StoreState,
} from "../../declarations";
import {
  HisoryHelperService,
  ProjectionHelperService,
} from "../../services";

const cloneDeep = require("lodash.clonedeep");

export const clearCommandsReducer: Reducer<StoreState> = (
    state,
    action,
) => {
    switch (action.type) {
        case MOUSE_DOWN:
            const payload = action.payload;
            const camera  = state.data.camera;
            const molecule = state.data.molecule;
            const position  = payload;
            let newMolecule: JMolWrapModel = cloneDeep(molecule);

            const activeAtom = ProjectionHelperService.getProjectionAtom({
                position, camera, molecule,
            });

            if (activeAtom) {
                const newState = HisoryHelperService.saveRecoveryPoint(state) as StoreState;
                newMolecule = removeAtom(newMolecule, activeAtom);
                return replaceMolecule(newState, newMolecule);
            }

            const activeBond = ProjectionHelperService.getProjectionBond({
                position, camera, molecule,
            });
            if (activeBond) {
                const newState = HisoryHelperService.saveRecoveryPoint(state) as StoreState;
                newMolecule = removeBond(newMolecule, activeBond);
                return replaceMolecule(newState, newMolecule);
            }

            return state;
      default:
        return state;
    }
};
function removeAtom(molecule: JMolWrapModel, atom: JMolAtomWrap) {
    const atomId = atom.id;
    delete molecule.atoms[atomId];

    const bondIdsToDelete =
        Object.keys(molecule.bonds)
          .filter((bondId) => {
              const bond = molecule.bonds[bondId];
              return (
                  bond.atom1 === atomId ||
                  bond.atom2 === atomId
              );
          });
    bondIdsToDelete.forEach((bondId) => {
        delete molecule.bonds[bondId];
    });

    return molecule;
}

function removeBond(molecule: JMolWrapModel, bond: JMolBondWrap) {
    const currentBondId = bond.id;
    let atom1Id = bond.atom1;
    let atom2Id = bond.atom2;

    delete molecule.bonds[currentBondId];
    Object.keys(molecule.bonds).forEach((bondId) => {
        const mBond = molecule.bonds[bondId];
        if (mBond.atom1 === atom1Id || mBond.atom2 === atom1Id) {
            atom1Id = "";
        }
        if (mBond.atom1 === atom2Id || mBond.atom2 === atom2Id) {
            atom2Id = "";
        }
    });
    if (atom1Id) {
        delete molecule.atoms[atom1Id];
    }
    if (atom2Id) {
        delete molecule.atoms[atom2Id];
    }

    return molecule;
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
