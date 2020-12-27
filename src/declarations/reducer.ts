import {
    Actions,
} from "../actions";

export type Reducer<T> = (state: T, action: Actions) => T;
