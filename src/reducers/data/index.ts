import { type DataModelState, type Reducer } from '../../declarations/index.js';
import { cameraReducer } from './cameta.reducer.js';
import { moleculeReducer } from './molecule.reducer.js';

export const dataReducer: Reducer<DataModelState> = (state, action) => ({
  molecule: moleculeReducer(state.molecule, action),
  camera: cameraReducer(state.camera, action),
});
