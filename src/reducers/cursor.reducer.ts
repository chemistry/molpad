import {
    CursorState,
    MOUSE_DOWN,
    MOUSE_LEAVE,
    MOUSE_MOVE,
    MOUSE_UP,
    Reducer,
} from "../declarations";

export const cursorReducer: Reducer<CursorState> = (
    state,
    action,
) => {

      switch (action.type) {
          case MOUSE_DOWN:
              const {x, y} = action.payload;
              return {
                  ...state,
                  mouseClick: true,
                  mouseBegin: { x, y },
                  mouseCurrent: { x, y },
              };

          case MOUSE_UP:
              if (!state.mouseClick) {
                  return state;
              }
              return {
                  ...state,
                  mouseClick: false,
                  mouseBegin: state.mouseBegin,
                  mouseCurrent: {
                    x: action.payload.x,
                    y: action.payload.y,
                  },
              };

          case MOUSE_MOVE:
              if (!state.mouseClick) {
                  return state;
              }
              return {
                  ...state,
                  mouseCurrent: {
                    x: action.payload.x,
                    y: action.payload.y,
                  },
              };

          case MOUSE_LEAVE:
              if (!state.mouseClick) {
                  return state;
              }
              return {
                  ...state,
                  mouseClick: false,
              };

          default:
            return state;
      }
};
