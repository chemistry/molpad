import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { StoreState } from '../declarations/store.js';
import { Actions } from '../actions/index.js';
import { rootReducer, defaultState } from '../reducers/index.js';

type MolpadStore = StoreState & {
  dispatch: (action: Actions) => void;
};

export const useMolpadStore = create<MolpadStore>()(
  devtools((set) => ({
    ...defaultState,
    dispatch: (action: Actions) => {
      set((state) => {
        const newState = rootReducer(state, action);
        return newState;
      });
    },
  }))
);
