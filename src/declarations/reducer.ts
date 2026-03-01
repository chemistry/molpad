import { Actions } from '../actions/index.js';

export type Reducer<T> = (state: T, action: Actions) => T;
