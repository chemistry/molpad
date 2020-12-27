import {
    HIDE_PERIODIC_TABLE,
    Reducer,
    SET_TOOL_MODE,
    ToolBarState,
    ToolMode,
} from "../declarations";

export const toolbarReducer: Reducer<ToolBarState> = (
    state,
    action,
) => {
    switch (action.type) {
        case SET_TOOL_MODE:
          const { mode, type } = action.payload;
          return {
              mode,
              type,
          };
        case HIDE_PERIODIC_TABLE:
          const { selected } = action.payload;
          return {
              mode: ToolMode.atom,
              type: selected,
          };

        default:
          return state;
    }
};
