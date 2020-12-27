import {
    DataModelState,
    Reducer,
} from "../../declarations";
import { cameraReducer } from "./cameta.reducer";
import { moleculeReducer } from "./molecule.reducer";

export const dataReducer: Reducer<DataModelState> = (
    state,
    action,
) => {
    return {
        molecule: moleculeReducer(state.molecule, action),
        camera: cameraReducer(state.camera, action),
    };
};
