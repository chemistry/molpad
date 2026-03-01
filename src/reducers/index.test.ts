import {
  clearAllAction,
  redoAction,
  undoAction,
  zoomInAction,
  zoomOutAction,
} from '../actions/index.js';
import { defaultState, rootReducer } from './index.js';

describe('rootReducer', () => {
  let mockState: any;
  let mockAction: any;
  let actualState: any;

  it('should be defined', () => {
    expect(rootReducer).toBeDefined();
  });

  it('should return state unchanged for unknown action', () => {
    mockAction = { type: 'UNKNOWN-ACTION' } as any;
    actualState = rootReducer(defaultState, mockAction);

    expect(actualState).toEqual(defaultState);
  });
});
