import { settingsReducer } from "./index";

import {
   hidePeriodicTableAction,
} from "../../actions";

describe("settingsReducer", () => {
    const sut = settingsReducer;
    let actualState;
    let mockAction;
    let mockState: any;

    it("should be defined", () => {
        expect(settingsReducer).toBeDefined();
    });

    it("should return initiall state for unknown action", () => {
        mockState = { mock: "MOCK-STATE" } as any;
        mockAction = { type: "UNKNOWN-ACTION" } as any;
        actualState = settingsReducer(mockState, mockAction);

        expect(actualState).toEqual(mockState);
    });

    it("should return initiall when payload is empty", () => {
        mockState = { mock: "MOCK-STATE" } as any;

        mockAction = hidePeriodicTableAction("");
        actualState = settingsReducer(mockState, mockAction);
        expect(actualState).toEqual(mockState);
    });

    it("should set additional elements to array", () => {
        mockState = { additionalElements: [] } as any;

        mockAction = hidePeriodicTableAction("X");
        actualState = settingsReducer(mockState, mockAction);
        expect(actualState).toEqual(jasmine.objectContaining({
            additionalElements: ["X"],
        }));
    });

    it("should not set additional element if such present in array", () => {
        mockState = { additionalElements: ["X"] } as any;

        mockAction = hidePeriodicTableAction("X");
        actualState = settingsReducer(mockState, mockAction);
        expect(actualState).toEqual(jasmine.objectContaining({
            additionalElements: ["X"],
        }));
    });

    it("should correctly replace elements sequence", () => {
        mockState = { additionalElements: ["A", "B"] } as any;

        mockAction = hidePeriodicTableAction("C");
        actualState = settingsReducer(mockState, mockAction);
        expect(actualState).toEqual(jasmine.objectContaining({
            additionalElements: ["B", "C"],
        }));
    });

    it("should set existing element to last", () => {
        mockState = { additionalElements: ["A", "B"] } as any;

        mockAction = hidePeriodicTableAction("A");
        actualState = settingsReducer(mockState, mockAction);
        expect(actualState).toEqual(jasmine.objectContaining({
            additionalElements: ["B", "A"],
        }));
    });
});
