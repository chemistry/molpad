import {
    CameraState,
} from "../declarations";
const cloneDeep = require("lodash.clonedeep");

export const ZOOM_IN_FACTOR = 1.25;
export const ZOOM_OUT_FACTOR = 1 / ZOOM_IN_FACTOR;
export const MAX_ZOOM_FACTOR = 50;
export const MIN_ZOOM_FACTOR = 20;
export const EPSILON = 0.00001;

import {
    Vec2,
} from "../declarations";

export class CameraHelperService {
    public static project(camera: CameraState, { x, y }: Vec2): Vec2 {
        return {
            x: x * camera.scale + camera.translation.x,
            y: y * camera.scale + camera.translation.y,
        };
    }
    public static unproject(camera: CameraState, { x, y }: Vec2): Vec2 {
        return {
            x: (x - camera.translation.x) / camera.scale,
            y: (y - camera.translation.y) / camera.scale,
        };
    }

    public static canZoomIn(camera: CameraState): boolean {
        return (Math.abs(camera.scale) < MAX_ZOOM_FACTOR - EPSILON);
    }

    public static canZoomOut(camera: CameraState): boolean {
        return (Math.abs(camera.scale) > MIN_ZOOM_FACTOR + EPSILON);
    }

    public static zoomIn(camera: CameraState): CameraState {
        if (!CameraHelperService.canZoomIn(camera)) {
            return camera;
        }
        const newCamera: CameraState = cloneDeep(camera);

        newCamera.scale = Math.min(Math.abs(camera.scale) * ZOOM_IN_FACTOR, MAX_ZOOM_FACTOR);
        return newCamera;
    }

    public static zoomOut(camera: CameraState): CameraState {
        if (!CameraHelperService.canZoomOut(camera)) {
            return camera;
        }

        const newCamera: CameraState = cloneDeep(camera);
        newCamera.scale = Math.max(Math.abs(camera.scale) * ZOOM_OUT_FACTOR, MIN_ZOOM_FACTOR);

        return newCamera;
    }
}
