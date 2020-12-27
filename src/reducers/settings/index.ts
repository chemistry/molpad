import {
    HIDE_PERIODIC_TABLE,
    Reducer,
    UserSettingsState,
} from "../../declarations";

export const settingsReducer: Reducer<UserSettingsState> = (
    state,
    action,
) => {
    switch (action.type) {
        case HIDE_PERIODIC_TABLE:
          const selected = action.payload.selected;
          if (selected) {
              const newAdditionalElements = state.additionalElements.slice(0);
              const idx = newAdditionalElements.indexOf(selected);
              if (idx > -1) {
                  newAdditionalElements.splice(idx, 1);
              }
              newAdditionalElements.push(selected);
              return {
                  ...state,
                  additionalElements: newAdditionalElements.slice(-2),
              };
          }
          return state;
        default:
          return state;
    }
};
