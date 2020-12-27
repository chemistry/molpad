import {
    CLEAR_ALL,
    DataModelState,
    HIDE_PERIODIC_TABLE,
    REDO,
    Reducer,
    SHOW_PERIODIC_TABLE,
    StoreState,
    UNDO,
    ZOOM_IN,
    ZOOM_OUT,
} from "../declarations";
import {
    HisoryHelperService,
} from "../services";

export const preCombinedReducer: Reducer<StoreState> = (
    state,
    action,
) => {
    switch (action.type) {

        case CLEAR_ALL:
        case ZOOM_IN:
        case ZOOM_OUT:
            return HisoryHelperService.saveRecoveryPoint(state) as StoreState;

        case UNDO:
            return HisoryHelperService.undoHistory(state) as StoreState;

        case REDO:
           return HisoryHelperService.redoHistory(state) as StoreState;

        case SHOW_PERIODIC_TABLE:
            return {
              ...state,
              isTableShown: true,
            };

        case HIDE_PERIODIC_TABLE:
            return {
              ...state,
              isTableShown: false,
            };

        default:
            return state;
    }
};
