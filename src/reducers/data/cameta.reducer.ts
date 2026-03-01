import { CameraState, Reducer, ZOOM_IN, ZOOM_OUT } from '../../declarations/index.js';
import { CameraHelperService } from '../../services/index.js';

export const cameraReducer: Reducer<CameraState> = (state, action) => {
  switch (action.type) {
    case ZOOM_IN:
      return CameraHelperService.zoomIn(state);

    case ZOOM_OUT:
      return CameraHelperService.zoomOut(state);

    default:
      return state;
  }
};
