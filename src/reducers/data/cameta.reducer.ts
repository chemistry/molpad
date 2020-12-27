import {
    CameraState,
    Reducer,
    ZOOM_IN,
    ZOOM_OUT,
} from "../../declarations";
import {
    CameraHelperService,
} from "../../services";

export const cameraReducer: Reducer<CameraState> = (
    state,
    action,
) => {
    switch (action.type) {
        case ZOOM_IN:
            return CameraHelperService.zoomIn(state);

        case ZOOM_OUT:
          return CameraHelperService.zoomOut(state);

        default:
          return state;
    }
};
