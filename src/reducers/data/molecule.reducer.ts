import { CLEAR_ALL, JMolWrapModel, LOAD_MOLECULE, Reducer } from '../../declarations/index.js';
import { MoleculeHelperService } from '../../services/index.js';

export const moleculeReducer: Reducer<JMolWrapModel> = (state, action) => {
  switch (action.type) {
    case LOAD_MOLECULE: {
      const jmol = MoleculeHelperService.normalizeJmol(action.payload.molecule);
      return MoleculeHelperService.wrapMolecule(jmol);
    }

    case CLEAR_ALL:
      return {
        atoms: {},
        bonds: {},
        id: '',
        title: '',
      };
    default:
      return state;
  }
};
