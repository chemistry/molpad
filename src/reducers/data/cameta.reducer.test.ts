import { cameraReducer } from './cameta.reducer.js';
import type { CameraState } from '../../declarations/store.js';
import { ZOOM_IN, ZOOM_OUT, CLEAR_ALL } from '../../declarations/constants.js';
import type { Actions } from '../../actions/index.js';

function createCameraState(overrides: Partial<CameraState> = {}): CameraState {
  return {
    translation: { x: 0, y: 0 },
    scale: 45,
    ...overrides,
  };
}

describe('cameraReducer', () => {
  const sut = cameraReducer;

  it('should be defined', () => {
    expect(sut).toBeDefined();
  });

  describe('ZOOM_IN', () => {
    it('should increase the scale on ZOOM_IN', () => {
      const state = createCameraState({ scale: 30 });
      const action: Actions = { type: ZOOM_IN };
      const result = sut(state, action);
      expect(result.scale).toBeGreaterThan(30);
    });

    it('should not zoom in beyond MAX_ZOOM_FACTOR', () => {
      const state = createCameraState({ scale: 50 });
      const action: Actions = { type: ZOOM_IN };
      const result = sut(state, action);
      // Already at max, should return unchanged state reference
      expect(result).toBe(state);
      expect(result.scale).toBe(50);
    });

    it('should preserve translation when zooming in', () => {
      const state = createCameraState({
        scale: 30,
        translation: { x: 100, y: 200 },
      });
      const action: Actions = { type: ZOOM_IN };
      const result = sut(state, action);
      expect(result.translation.x).toBe(100);
      expect(result.translation.y).toBe(200);
    });
  });

  describe('ZOOM_OUT', () => {
    it('should decrease the scale on ZOOM_OUT', () => {
      const state = createCameraState({ scale: 45 });
      const action: Actions = { type: ZOOM_OUT };
      const result = sut(state, action);
      expect(result.scale).toBeLessThan(45);
    });

    it('should not zoom out beyond MIN_ZOOM_FACTOR', () => {
      const state = createCameraState({ scale: 20 });
      const action: Actions = { type: ZOOM_OUT };
      const result = sut(state, action);
      // Already at min, should return unchanged state reference
      expect(result).toBe(state);
      expect(result.scale).toBe(20);
    });

    it('should preserve translation when zooming out', () => {
      const state = createCameraState({
        scale: 45,
        translation: { x: 50, y: 75 },
      });
      const action: Actions = { type: ZOOM_OUT };
      const result = sut(state, action);
      expect(result.translation.x).toBe(50);
      expect(result.translation.y).toBe(75);
    });
  });

  describe('default case', () => {
    it('should return state unchanged for unhandled action types', () => {
      const state = createCameraState();
      const action: Actions = { type: CLEAR_ALL };
      const result = sut(state, action);
      expect(result).toBe(state);
    });
  });
});
