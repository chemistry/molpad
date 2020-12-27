import {
    Reducer,
    StoreState,
    ToolMode,
} from "../declarations";
import { cursorReducer } from "./cursor.reducer";
import { dataReducer } from "./data";
import { postCombineCacheReducer } from "./post-combine-cache.reducer";
import { postCombineCommandsReducer } from "./post-combine-commands.reducer";
import { preCombinedReducer } from "./pre-combined.reducer";
import { settingsReducer } from "./settings";
import { toolbarReducer } from "./toolbar.reducer";

export const defaultState = {
    toolbar: { mode: ToolMode.bond, type: "1" },
    cursor: {
        mouseClick: false,
        mouseBegin: { x: 0, y: 0 },
        mouseCurrent: { x: 0, y: 0 },
        data: null,
    },
    data: {
        molecule: {
            atoms: {},
            bonds: {},
            id: "",
            title: "",
        },
        camera: {
            translation: {
                x: 0,
                y: 0,
            },
            scale: 45,
        },
    },
    settings: {
        additionalElements: [],
    },
    cache: {
        bondsClasification: {
        },
    },
    pastData: [],
    futureData: [],
    isTableShown: false,
};

export const rootReducer: Reducer<StoreState> = (
    state = defaultState,
    action,
) => {
    let modifiedState = preCombinedReducer(state, action);

    modifiedState = {
        ...modifiedState,
        cursor: cursorReducer(modifiedState.cursor, action),
        toolbar: toolbarReducer(modifiedState.toolbar, action),
        data: dataReducer(modifiedState.data, action),
        settings: settingsReducer(modifiedState.settings, action),
    };

    modifiedState = postCombineCommandsReducer(modifiedState, action);

    modifiedState = postCombineCacheReducer(modifiedState, action);

    return modifiedState;
};
