import {
    CameraState,
    JMolAtomWrap,
    JMolBondWrap,
    JMolWrapModel,
    MOUSE_DOWN,
    MOUSE_LEAVE,
    MOUSE_MOVE,
    MOUSE_UP,
    Reducer,
    StoreState,
    ToolMode,
} from "../declarations";

import {
    HisoryHelperService,
    ProjectionHelperService,
} from "../services";

const cloneDeep = require("lodash.clonedeep");

import {
    atomCommandsReducer,
    bondCommandsReducer,
    clearCommandsReducer,
    fragmentCommandsReducer,
} from "./commands";

const commandsReducer: Reducer<StoreState> = (
    state,
    action,
) => {
    switch (state.toolbar.mode) {
        case ToolMode.atom:
            return atomCommandsReducer(state, action);

        case ToolMode.bond:
            return bondCommandsReducer(state, action);

        case ToolMode.clear:
            return clearCommandsReducer(state, action);

        case ToolMode.fragment:
            return fragmentCommandsReducer(state, action);

        case ToolMode.none:
        default:
          return state;
    }
};

export const postCombineCommandsReducer: Reducer<StoreState> = (
    state,
    action,
) => {
      switch (action.type) {
          case MOUSE_DOWN:
          case MOUSE_MOVE:
          case MOUSE_UP:
          case MOUSE_LEAVE:
              return commandsReducer(state, action);
          default:
              return state;
      }
};
