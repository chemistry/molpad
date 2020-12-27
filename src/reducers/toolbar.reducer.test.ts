import {
   setToolModeAction,
} from "../actions";
import {
    ToolMode,
} from "../declarations";
import { toolbarReducer } from "./toolbar.reducer";

describe("toolbar reducers", () => {
    const sut = toolbarReducer;
    let actualState;
    let mockAction;
    let mockState: any;

    it("should be defined", () => {
        expect(sut).toBeDefined();
    });

    it("should return initiall state for unknown action", () => {
        mockState = { mock: "MOCK-STATE" } as any;
        mockAction = { type: "UNKNOWN-ACTION" } as any;
        actualState = toolbarReducer(mockState, mockAction);

        expect(actualState).toEqual(mockState);
    });

    describe("#setToolModeAction", () => {
        it("should set tool mode on setToolModeAction", () => {
            mockState = {  } as any;
            const toolBarMode = {
                mode: ToolMode.atom, type: "C",
            };
            mockAction = setToolModeAction(toolBarMode);
            actualState = toolbarReducer(mockState, mockAction);
            expect(actualState).toEqual(toolBarMode);
        });
    });
});
