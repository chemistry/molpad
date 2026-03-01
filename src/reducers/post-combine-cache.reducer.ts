import { Molecule, MoleculeDataFormat } from '@chemistry/molecule';
import {
  CLEAR_ALL,
  JMolBondsClassification,
  LOAD_MOLECULE,
  MOUSE_DOWN,
  MOUSE_LEAVE,
  MOUSE_UP,
  REDO,
  Reducer,
  StoreState,
  ToolMode,
  UNDO,
} from '../declarations/index.js';

const updateMoleculeCache: Reducer<StoreState> = (state, _action) => {
  let bondsClasification: JMolBondsClassification = {};
  try {
    const molecule = new Molecule();
    molecule.load(state.data.molecule, MoleculeDataFormat.jnmol);
    bondsClasification =
      (
        molecule as unknown as { getBondsViewClasification(): JMolBondsClassification }
      ).getBondsViewClasification() ?? {};
  } catch {
    // Molecule load error - default to empty classification
  }

  return {
    ...state,
    cache: {
      ...state.cache,
      bondsClasification,
    },
  };
};

export const postCombineCacheReducer: Reducer<StoreState> = (state, action) => {
  switch (action.type) {
    case LOAD_MOLECULE:
    case CLEAR_ALL:
    case UNDO:
    case REDO:
      return updateMoleculeCache(state, action);
    case MOUSE_LEAVE:
    case MOUSE_DOWN:
    case MOUSE_UP:
      if (state.toolbar.mode !== ToolMode.none) {
        return updateMoleculeCache(state, action);
      }
      return state;
    default:
      return state;
  }
};
