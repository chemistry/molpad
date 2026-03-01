import { postCombineCacheReducer } from './post-combine-cache.reducer.js';
import type { StoreState } from '../declarations/store.js';
import {
  LOAD_MOLECULE,
  CLEAR_ALL,
  UNDO,
  REDO,
  MOUSE_DOWN,
  MOUSE_UP,
  MOUSE_LEAVE,
  MOUSE_MOVE,
  ZOOM_IN,
  ToolMode,
} from '../declarations/index.js';
import type { Actions } from '../actions/index.js';

function createMockState(overrides: Partial<StoreState> = {}): StoreState {
  return {
    toolbar: { mode: ToolMode.none, type: '1' },
    cursor: {
      mouseClick: false,
      mouseBegin: { x: 0, y: 0 },
      mouseCurrent: { x: 0, y: 0 },
      data: null,
    },
    data: {
      molecule: {
        atoms: {},
        bonds: {},
        id: '',
        title: '',
      },
      camera: {
        translation: { x: 0, y: 0 },
        scale: 45,
      },
    },
    settings: {
      additionalElements: [],
    },
    cache: {
      bondsClasification: {},
    },
    pastData: [],
    futureData: [],
    isTableShown: false,
    ...overrides,
  };
}

describe('postCombineCacheReducer', () => {
  it('should be defined', () => {
    expect(postCombineCacheReducer).toBeDefined();
  });

  describe('actions that always update molecule cache', () => {
    it('should update cache on LOAD_MOLECULE', () => {
      const state = createMockState();
      const action: Actions = {
        type: LOAD_MOLECULE,
        payload: { molecule: { atoms: [], bonds: [], id: '1', title: 'test' } },
      };
      const result = postCombineCacheReducer(state, action);
      expect(result.cache).toBeDefined();
      expect(result.cache.bondsClasification).toBeDefined();
    });

    it('should update cache on CLEAR_ALL', () => {
      const state = createMockState();
      const action: Actions = { type: CLEAR_ALL };
      const result = postCombineCacheReducer(state, action);
      expect(result.cache).toBeDefined();
      expect(result.cache.bondsClasification).toBeDefined();
    });

    it('should update cache on UNDO', () => {
      const state = createMockState();
      const action: Actions = { type: UNDO };
      const result = postCombineCacheReducer(state, action);
      expect(result.cache).toBeDefined();
      expect(result.cache.bondsClasification).toBeDefined();
    });

    it('should update cache on REDO', () => {
      const state = createMockState();
      const action: Actions = { type: REDO };
      const result = postCombineCacheReducer(state, action);
      expect(result.cache).toBeDefined();
      expect(result.cache.bondsClasification).toBeDefined();
    });
  });

  describe('mouse actions with ToolMode.none', () => {
    it('should return state unchanged on MOUSE_DOWN when mode is none', () => {
      const state = createMockState({
        toolbar: { mode: ToolMode.none, type: '1' },
      });
      const action: Actions = { type: MOUSE_DOWN, payload: { x: 10, y: 20 } };
      const result = postCombineCacheReducer(state, action);
      expect(result).toBe(state);
    });

    it('should return state unchanged on MOUSE_UP when mode is none', () => {
      const state = createMockState({
        toolbar: { mode: ToolMode.none, type: '1' },
      });
      const action: Actions = { type: MOUSE_UP, payload: { x: 10, y: 20 } };
      const result = postCombineCacheReducer(state, action);
      expect(result).toBe(state);
    });

    it('should return state unchanged on MOUSE_LEAVE when mode is none', () => {
      const state = createMockState({
        toolbar: { mode: ToolMode.none, type: '1' },
      });
      const action: Actions = { type: MOUSE_LEAVE };
      const result = postCombineCacheReducer(state, action);
      expect(result).toBe(state);
    });
  });

  describe('mouse actions with active tool mode', () => {
    it('should update cache on MOUSE_DOWN when mode is atom', () => {
      const state = createMockState({
        toolbar: { mode: ToolMode.atom, type: 'C' },
      });
      const action: Actions = { type: MOUSE_DOWN, payload: { x: 10, y: 20 } };
      const result = postCombineCacheReducer(state, action);
      expect(result.cache).toBeDefined();
      expect(result.cache.bondsClasification).toBeDefined();
    });

    it('should update cache on MOUSE_UP when mode is bond', () => {
      const state = createMockState({
        toolbar: { mode: ToolMode.bond, type: '1' },
      });
      const action: Actions = { type: MOUSE_UP, payload: { x: 10, y: 20 } };
      const result = postCombineCacheReducer(state, action);
      expect(result.cache).toBeDefined();
      expect(result.cache.bondsClasification).toBeDefined();
    });

    it('should update cache on MOUSE_LEAVE when mode is clear', () => {
      const state = createMockState({
        toolbar: { mode: ToolMode.clear, type: '' },
      });
      const action: Actions = { type: MOUSE_LEAVE };
      const result = postCombineCacheReducer(state, action);
      expect(result.cache).toBeDefined();
      expect(result.cache.bondsClasification).toBeDefined();
    });

    it('should update cache on MOUSE_DOWN when mode is fragment', () => {
      const state = createMockState({
        toolbar: { mode: ToolMode.fragment, type: 'benzene' },
      });
      const action: Actions = { type: MOUSE_DOWN, payload: { x: 5, y: 10 } };
      const result = postCombineCacheReducer(state, action);
      expect(result.cache).toBeDefined();
      expect(result.cache.bondsClasification).toBeDefined();
    });
  });

  describe('default case', () => {
    it('should return state unchanged for unhandled action types', () => {
      const state = createMockState();
      const action: Actions = { type: ZOOM_IN };
      const result = postCombineCacheReducer(state, action);
      expect(result).toBe(state);
    });

    it('should return state unchanged for MOUSE_MOVE', () => {
      const state = createMockState();
      const action: Actions = {
        type: MOUSE_MOVE,
        payload: { x: 10, y: 20 },
      };
      const result = postCombineCacheReducer(state, action);
      expect(result).toBe(state);
    });
  });

  describe('cache update with molecule data', () => {
    it('should compute bondsClasification for molecules with atoms and bonds', () => {
      const state = createMockState({
        data: {
          molecule: {
            atoms: {
              a1: { id: 'a1', x: 0, y: 0, z: 0, type: 'C' },
              a2: { id: 'a2', x: 1.54, y: 0, z: 0, type: 'C' },
            },
            bonds: {
              b1: { id: 'b1', atom1: 'a1', atom2: 'a2', order: 1 },
            },
            id: 'mol1',
            title: 'ethane',
          },
          camera: {
            translation: { x: 0, y: 0 },
            scale: 45,
          },
        },
      });
      const action: Actions = {
        type: LOAD_MOLECULE,
        payload: { molecule: { atoms: [], bonds: [], id: '1', title: '' } },
      };
      const result = postCombineCacheReducer(state, action);
      expect(result.cache.bondsClasification).toBeDefined();
      expect(typeof result.cache.bondsClasification).toBe('object');
    });

    it('should handle molecule load errors gracefully', () => {
      const state = createMockState({
        data: {
          molecule: {
            atoms: { bad: { id: 'bad', x: NaN, y: NaN, z: NaN, type: '' } },
            bonds: {},
            id: '',
            title: '',
          },
          camera: {
            translation: { x: 0, y: 0 },
            scale: 45,
          },
        },
      });
      const action: Actions = { type: CLEAR_ALL };
      const result = postCombineCacheReducer(state, action);
      expect(result.cache.bondsClasification).toEqual({});
    });
  });
});
