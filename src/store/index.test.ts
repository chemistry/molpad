import { useMolpadStore } from './index.js';
import { defaultState } from '../reducers/index.js';
import { ZOOM_IN, ZOOM_OUT, CLEAR_ALL, NOOP } from '../declarations/constants.js';

describe('useMolpadStore', () => {
  beforeEach(() => {
    useMolpadStore.setState({
      ...defaultState,
      dispatch: useMolpadStore.getState().dispatch,
    });
  });

  it('should be defined', () => {
    expect(useMolpadStore).toBeDefined();
  });

  it('should initialize with defaultState values', () => {
    const state = useMolpadStore.getState();
    expect(state.toolbar).toEqual(defaultState.toolbar);
    expect(state.cursor).toEqual(defaultState.cursor);
    expect(state.data).toEqual(defaultState.data);
    expect(state.cache).toEqual(defaultState.cache);
    expect(state.settings).toEqual(defaultState.settings);
    expect(state.pastData).toEqual(defaultState.pastData);
    expect(state.futureData).toEqual(defaultState.futureData);
    expect(state.isTableShown).toBe(defaultState.isTableShown);
  });

  it('should have a dispatch function', () => {
    const state = useMolpadStore.getState();
    expect(typeof state.dispatch).toBe('function');
  });

  it('should dispatch actions through rootReducer', () => {
    const initialScale = useMolpadStore.getState().data.camera.scale;
    useMolpadStore.getState().dispatch({ type: ZOOM_IN });
    const newScale = useMolpadStore.getState().data.camera.scale;
    expect(newScale).not.toBe(initialScale);
    expect(newScale).toBeGreaterThan(initialScale);
  });

  it('should return unchanged state for unknown action types', () => {
    const stateBefore = useMolpadStore.getState();
    useMolpadStore.getState().dispatch({ type: NOOP } as any);
    const stateAfter = useMolpadStore.getState();
    expect(stateAfter.toolbar).toEqual(stateBefore.toolbar);
    expect(stateAfter.data).toEqual(stateBefore.data);
    expect(stateAfter.cache).toEqual(stateBefore.cache);
  });

  it('should handle ZOOM_OUT action', () => {
    const initialScale = useMolpadStore.getState().data.camera.scale;
    useMolpadStore.getState().dispatch({ type: ZOOM_OUT });
    const newScale = useMolpadStore.getState().data.camera.scale;
    expect(newScale).toBeLessThan(initialScale);
  });

  it('should handle CLEAR_ALL action', () => {
    useMolpadStore.getState().dispatch({ type: CLEAR_ALL });
    const state = useMolpadStore.getState();
    expect(state.data.molecule.atoms).toEqual({});
    expect(state.data.molecule.bonds).toEqual({});
  });
});
