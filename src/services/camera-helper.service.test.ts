import {
   clearAllAction,
   redoAction,
   undoAction,
   zoomInAction,
   zoomOutAction,
} from "../actions";
import {
  CameraHelperService,
  MAX_ZOOM_FACTOR,
  MIN_ZOOM_FACTOR,
  ZOOM_IN_FACTOR,
  ZOOM_OUT_FACTOR,
} from "./camera-helper.service";

describe("CameraHelperService", () => {
    const sut = CameraHelperService;

    it("should be defined", () => {
        expect(CameraHelperService).toBeDefined();
    });

    describe("project", () => {
        it("should project based on proj matrix", () => {
            const mockCamera = {
                scale: 2,
                translation: {
                  x: 10,
                  y: 10,
                },
            };
            const p = {
                x: 7,
                y: 6,
            };
            const projection = CameraHelperService.project(mockCamera, p);

            expect(projection).toEqual({x: 24, y: 22 });
        });
    });

    describe("unproject", () => {
        it("should unproject based on proj matrix", () => {
            const mockCamera = {
                scale: 2,
                translation: {
                  x: 10,
                  y: 10,
                },
            };
            const p = {
                x: 24,
                y: 22,
            };
            const projection = CameraHelperService.unproject(mockCamera, p);

            expect(projection).toEqual({x: 7, y: 6 });
        });
    });

    describe("canZoomIn", () => {
        it("should return true when zoom above Max zoom", () => {
            const mockCamera = {
                scale: MAX_ZOOM_FACTOR - 1,
                translation: {x: 0, y: 0},
            };
            const res = sut.canZoomIn(mockCamera);
            expect(res).toBe(true);
        });

        it("should return false when zoom above Max zoom", () => {
            const mockCamera = {
                scale: MAX_ZOOM_FACTOR + 1,
                translation: {x: 0, y: 0},
            };
            const res = sut.canZoomIn(mockCamera);
            expect(res).toBe(false);
        });
    });

    describe("canZoomOut", () => {
        it("should return true when zoom above Min zoom", () => {
            const mockCamera = {
                scale: MIN_ZOOM_FACTOR + 1,
                translation: {x: 0, y: 0},
            };
            const res = sut.canZoomOut(mockCamera);
            expect(res).toBe(true);
        });

        it("should return false when zoom above Max zoom", () => {
            const mockCamera = {
                scale: MIN_ZOOM_FACTOR - 1,
                translation: {x: 0, y: 0},
            };
            const res = sut.canZoomOut(mockCamera);
            expect(res).toBe(false);
        });
    });

    describe("zoomIn", () => {
        it("should not zoom when scale is maximal", () => {
            const mockCamera = {
                scale: MAX_ZOOM_FACTOR + 1,
                translation: {x: 0, y: 0},
            };
            const res = sut.zoomIn(mockCamera);
            expect(res).toEqual(mockCamera);
        });
        it("shoud increase scale when zoomIn", () => {
            const mockCamera = {
                scale: MAX_ZOOM_FACTOR - 5,
                translation: {x: 0, y: 0},
            };
            const res = sut.zoomIn(mockCamera);
            expect(res.scale).toBeGreaterThan(mockCamera.scale);
        });
    });

    describe("zoomOut", () => {
          it("should not zoom when scale is maximal", () => {
              const mockCamera = {
                  scale: MIN_ZOOM_FACTOR - 1,
                  translation: {x: 0, y: 0},
              };
              const res = sut.zoomOut(mockCamera);
              expect(res).toEqual(mockCamera);
          });
          it("shoud increase scale when zoomIn", () => {
              const mockCamera = {
                  scale: MAX_ZOOM_FACTOR - 5,
                  translation: {x: 0, y: 0},
              };
              const res = sut.zoomOut(mockCamera);
              expect(res.scale).toBeLessThan(mockCamera.scale);
          });
    });
});
