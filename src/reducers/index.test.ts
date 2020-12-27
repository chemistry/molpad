import {
   clearAllAction,
   redoAction,
   undoAction,
   zoomInAction,
   zoomOutAction,
} from "../actions";
import { defaultState, rootReducer } from "./index";

describe("rootReducer", () => {
    let mockState: any;
    let mockAction: any;
    let actualState: any;

    it("should be defined", () => {
        expect(rootReducer).toBeDefined();
    });

    it("should return default state for initial call", () => {
        mockState = undefined;
        mockAction = { type: "UNKNOWN-ACTION" } as any;
        actualState = rootReducer(mockState, mockAction);

        expect(actualState).toEqual(defaultState);
    });
});
