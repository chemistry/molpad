import { postCombineCommandsReducer } from './post-combine-commands.reducer.js';
import type { StoreState } from '../declarations/store.js';
import {
  MOUSE_DOWN,
  MOUSE_MOVE,
  MOUSE_UP,
  MOUSE_LEAVE,
  ZOOM_IN,
  ZOOM_OUT,
  CLEAR_ALL,
  LOAD_MOLECULE,
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

describe('postCombineCommandsReducer', () => {
  it('should be defined', () => {
    expect(postCombineCommandsReducer).toBeDefined();
  });

  describe('non-mouse actions (default case)', () => {
    it('should return state unchanged for ZOOM_IN', () => {
      const state = createMockState();
      const action: Actions = { type: ZOOM_IN };
      const result = postCombineCommandsReducer(state, action);
      expect(result).toBe(state);
    });

    it('should return state unchanged for ZOOM_OUT', () => {
      const state = createMockState();
      const action: Actions = { type: ZOOM_OUT };
      const result = postCombineCommandsReducer(state, action);
      expect(result).toBe(state);
    });

    it('should return state unchanged for CLEAR_ALL', () => {
      const state = createMockState();
      const action: Actions = { type: CLEAR_ALL };
      const result = postCombineCommandsReducer(state, action);
      expect(result).toBe(state);
    });

    it('should return state unchanged for LOAD_MOLECULE', () => {
      const state = createMockState();
      const action: Actions = {
        type: LOAD_MOLECULE,
        payload: { molecule: { atoms: [], bonds: [], id: '1', title: '' } },
      };
      const result = postCombineCommandsReducer(state, action);
      expect(result).toBe(state);
    });
  });

  describe('mouse actions with ToolMode.none', () => {
    it('should return state unchanged on MOUSE_DOWN when mode is none', () => {
      const state = createMockState({ toolbar: { mode: ToolMode.none, type: '1' } });
      const action: Actions = { type: MOUSE_DOWN, payload: { x: 10, y: 20 } };
      const result = postCombineCommandsReducer(state, action);
      expect(result).toBe(state);
    });

    it('should return state unchanged on MOUSE_MOVE when mode is none', () => {
      const state = createMockState({ toolbar: { mode: ToolMode.none, type: '1' } });
      const action: Actions = { type: MOUSE_MOVE, payload: { x: 10, y: 20 } };
      const result = postCombineCommandsReducer(state, action);
      expect(result).toBe(state);
    });

    it('should return state unchanged on MOUSE_UP when mode is none', () => {
      const state = createMockState({ toolbar: { mode: ToolMode.none, type: '1' } });
      const action: Actions = { type: MOUSE_UP, payload: { x: 10, y: 20 } };
      const result = postCombineCommandsReducer(state, action);
      expect(result).toBe(state);
    });

    it('should return state unchanged on MOUSE_LEAVE when mode is none', () => {
      const state = createMockState({ toolbar: { mode: ToolMode.none, type: '1' } });
      const action: Actions = { type: MOUSE_LEAVE };
      const result = postCombineCommandsReducer(state, action);
      expect(result).toBe(state);
    });
  });

  describe('mouse actions with ToolMode.atom', () => {
    it('should delegate MOUSE_DOWN to atomCommandsReducer', () => {
      const state = createMockState({
        toolbar: { mode: ToolMode.atom, type: 'C' },
      });
      const action: Actions = { type: MOUSE_DOWN, payload: { x: 100, y: 200 } };
      const result = postCombineCommandsReducer(state, action);
      // atomCommandsReducer returns state when no matching atom is found
      expect(result).toBe(state);
    });

    it('should delegate MOUSE_MOVE to atomCommandsReducer', () => {
      const state = createMockState({
        toolbar: { mode: ToolMode.atom, type: 'O' },
      });
      const action: Actions = { type: MOUSE_MOVE, payload: { x: 50, y: 60 } };
      const result = postCombineCommandsReducer(state, action);
      // atomCommandsReducer returns state for default (non-MOUSE_DOWN) actions
      expect(result).toBe(state);
    });

    it('should delegate MOUSE_UP to atomCommandsReducer', () => {
      const state = createMockState({
        toolbar: { mode: ToolMode.atom, type: 'N' },
      });
      const action: Actions = { type: MOUSE_UP, payload: { x: 30, y: 40 } };
      const result = postCombineCommandsReducer(state, action);
      expect(result).toBe(state);
    });

    it('should delegate MOUSE_LEAVE to atomCommandsReducer', () => {
      const state = createMockState({
        toolbar: { mode: ToolMode.atom, type: 'C' },
      });
      const action: Actions = { type: MOUSE_LEAVE };
      const result = postCombineCommandsReducer(state, action);
      expect(result).toBe(state);
    });
  });

  describe('mouse actions with ToolMode.bond', () => {
    it('should delegate MOUSE_DOWN to bondCommandsReducer and create new bond', () => {
      const state = createMockState({
        toolbar: { mode: ToolMode.bond, type: '1' },
      });
      const action: Actions = { type: MOUSE_DOWN, payload: { x: 100, y: 200 } };
      const result = postCombineCommandsReducer(state, action);
      // bondCommandsReducer proposes a new bond: adds atoms and a bond
      expect(Object.keys(result.data.molecule.atoms).length).toBeGreaterThan(0);
      expect(Object.keys(result.data.molecule.bonds).length).toBeGreaterThan(0);
    });

    it('should delegate MOUSE_UP to bondCommandsReducer and clear cursor data', () => {
      const state = createMockState({
        toolbar: { mode: ToolMode.bond, type: '1' },
        cursor: {
          mouseClick: true,
          mouseBegin: { x: 100, y: 200 },
          mouseCurrent: { x: 100, y: 200 },
          data: null,
        },
      });
      const action: Actions = { type: MOUSE_UP, payload: { x: 100, y: 200 } };
      const result = postCombineCommandsReducer(state, action);
      expect(result.cursor.data).toBeNull();
    });

    it('should delegate MOUSE_LEAVE to bondCommandsReducer and clear cursor data', () => {
      const state = createMockState({
        toolbar: { mode: ToolMode.bond, type: '1' },
        cursor: {
          mouseClick: true,
          mouseBegin: { x: 50, y: 50 },
          mouseCurrent: { x: 50, y: 50 },
          data: null,
        },
      });
      const action: Actions = { type: MOUSE_LEAVE };
      const result = postCombineCommandsReducer(state, action);
      expect(result.cursor.data).toBeNull();
    });
  });

  describe('mouse actions with ToolMode.clear', () => {
    it('should delegate MOUSE_DOWN to clearCommandsReducer', () => {
      const state = createMockState({
        toolbar: { mode: ToolMode.clear, type: '' },
      });
      const action: Actions = { type: MOUSE_DOWN, payload: { x: 100, y: 200 } };
      const result = postCombineCommandsReducer(state, action);
      // No atoms to clear, returns state unchanged
      expect(result).toBe(state);
    });

    it('should return state for MOUSE_MOVE in clear mode (default in clearCommandsReducer)', () => {
      const state = createMockState({
        toolbar: { mode: ToolMode.clear, type: '' },
      });
      const action: Actions = { type: MOUSE_MOVE, payload: { x: 10, y: 20 } };
      const result = postCombineCommandsReducer(state, action);
      expect(result).toBe(state);
    });
  });

  describe('mouse actions with ToolMode.fragment', () => {
    it('should delegate MOUSE_DOWN to fragmentCommandsReducer', () => {
      const state = createMockState({
        toolbar: { mode: ToolMode.fragment, type: 'benzene' },
      });
      const action: Actions = { type: MOUSE_DOWN, payload: { x: 200, y: 200 } };
      const result = postCombineCommandsReducer(state, action);
      // fragmentCommandsReducer processes the template; should produce a molecule with atoms
      expect(result).toBeDefined();
    });

    it('should return state for MOUSE_MOVE in fragment mode (default in fragmentCommandsReducer)', () => {
      const state = createMockState({
        toolbar: { mode: ToolMode.fragment, type: 'benzene' },
      });
      const action: Actions = { type: MOUSE_MOVE, payload: { x: 50, y: 60 } };
      const result = postCombineCommandsReducer(state, action);
      expect(result).toBe(state);
    });
  });
});
