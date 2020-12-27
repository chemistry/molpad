import {
    JMolAtomWrap,
    JMolWrapModel,
    MOUSE_DOWN,
    MOUSE_LEAVE,
    MOUSE_MOVE,
    MOUSE_UP,
    Reducer,
    StoreState,
} from "../../declarations";
import {
  HisoryHelperService,
  ProjectionHelperService,
} from "../../services";

const cloneDeep = require("lodash.clonedeep");

export const atomCommandsReducer: Reducer<StoreState> = (
    state,
    action,
) => {
    switch (action.type) {
        case MOUSE_DOWN:
            const payload = action.payload;
            const activeItem = ProjectionHelperService.getProjectionAtom({
                position: { x: payload.x, y: payload.y },
                camera: state.data.camera,
                molecule: state.data.molecule,
            });
            const toolbarAtomType = state.toolbar.type;
            if (activeItem && activeItem.type !== toolbarAtomType) {
                const newAtom: JMolAtomWrap = cloneDeep(activeItem);
                newAtom.type = toolbarAtomType;
                const newState = HisoryHelperService.saveRecoveryPoint(state) as StoreState;
                const newMolecule = replaceAtom(newState.data.molecule, newAtom);

                return replaceMolecule(newState, newMolecule);
            }

            return state;
      default:
        return state;
    }
};

function replaceMolecule(state: StoreState, newMolecule: JMolWrapModel): StoreState {
    return {
        ...state,
        data: {
            ...state.data,
            molecule: newMolecule,
        },
    };
}

function replaceAtom(
    molecule: JMolWrapModel, atom: JMolAtomWrap,
): JMolWrapModel {
    return {
        ...molecule,
        atoms: {
            ...molecule.atoms,
            [atom.id]: atom,
        },
    };
}
