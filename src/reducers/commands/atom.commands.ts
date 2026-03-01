import {
  JMolAtomWrap,
  JMolWrapModel,
  MOUSE_DOWN,
  Reducer,
  StoreState,
} from '../../declarations/index.js';
import { HisoryHelperService, ProjectionHelperService } from '../../services/index.js';

export const atomCommandsReducer: Reducer<StoreState> = (state, action) => {
  switch (action.type) {
    case MOUSE_DOWN: {
      const payload = action.payload;
      const activeItem = ProjectionHelperService.getProjectionAtom({
        position: { x: payload.x, y: payload.y },
        camera: state.data.camera,
        molecule: state.data.molecule,
      });
      const toolbarAtomType = state.toolbar.type;
      if (activeItem && activeItem.type !== toolbarAtomType) {
        const newAtom: JMolAtomWrap = structuredClone(activeItem);
        newAtom.type = toolbarAtomType;
        const newState = HisoryHelperService.saveRecoveryPoint(state) as StoreState;
        const newMolecule = replaceAtom(newState.data.molecule, newAtom);

        return replaceMolecule(newState, newMolecule);
      }

      return state;
    }
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

function replaceAtom(molecule: JMolWrapModel, atom: JMolAtomWrap): JMolWrapModel {
  return {
    ...molecule,
    atoms: {
      ...molecule.atoms,
      [atom.id]: atom,
    },
  };
}
