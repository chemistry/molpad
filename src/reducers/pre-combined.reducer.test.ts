import {
   clearAllAction,
   redoAction,
   undoAction,
   zoomInAction,
   zoomOutAction,
} from "../actions";
import {
    MAX_UNDO_REDO_STACK_SIZE,
} from "../services";
import { preCombinedReducer} from "./pre-combined.reducer";

describe("preCombinedReducer", () => {
    let mockState: any;
    let mockAction: any;
    let actualState: any;

    it("should be defined", () => {
        expect(preCombinedReducer).toBeDefined();
    });

    it("should return initiall state for unknown action", () => {
        mockState = { mock: "MOCK-STATE" } as any;
        mockAction = { type: "UNKNOWN-ACTION" } as any;
        actualState = preCombinedReducer(mockState, mockAction);

        expect(actualState).toEqual(mockState);
    });

    describe("Undable Actions", () => {
        const toTest = [{
            name: "#CLEAR_ALL",
            actionCreator: clearAllAction,
        }, {
            name: "#ZOOM_IN",
            actionCreator: zoomInAction,
        }, {
            name: "#ZOOM_OUT",
            actionCreator: zoomOutAction,
        }];

        toTest.forEach((data) => {
            testUnableAction(data.name, data.actionCreator);
        });

        function testUnableAction(name: string, actionCreator: () => void) {
            describe(name, () => {
                it(name + " should save data to pastData", () => {
                    mockState = {
                        data: "MOCK-DATA-0",
                        pastData: ["MOCK-DATA-1"],
                        futureData: ["MOCK-DATA-2"],
                    };
                    mockAction = actionCreator();
                    actualState = preCombinedReducer(mockState, mockAction);

                    expect(actualState).toEqual({
                        data: "MOCK-DATA-0",
                        pastData: ["MOCK-DATA-1", "MOCK-DATA-0"],
                        futureData: [],
                    });
                });
            });
        }
    });

    describe("Undable Actions: #CLEAR_ALL", () => {
        // Clear All
        describe("#CLEAR_ALL", () => {
            it("should set mat stack size", () => {
                mockState = {
                    data: "MOCK-DATA-0",
                    pastData: Array(MAX_UNDO_REDO_STACK_SIZE).fill("MOCK-DATA"),
                    futureData: ["MOCK-DATA-2"],
                };
                actualState = preCombinedReducer(mockState, clearAllAction());
                expect(actualState.pastData.length).toEqual(MAX_UNDO_REDO_STACK_SIZE);
            });
        });
    });

    describe("#UNDO", () => {
        it("shoud move current data to past data", () => {
            mockState = {
                data: "MOCK-DATA-0",
                pastData: ["MOCK-DATA-1", "MOCK-DATA-2"],
                futureData: ["MOCK-DATA-3"],
            };

            mockAction = undoAction();
            actualState = preCombinedReducer(mockState, mockAction);

            expect(actualState).toEqual({
                data: "MOCK-DATA-2",
                pastData: ["MOCK-DATA-1"],
                futureData: ["MOCK-DATA-3", "MOCK-DATA-0"],
            });
        });
        it("should return original state if no past data", () => {
            mockState = {
                data: "MOCK-DATA-0",
                pastData: [],
                futureData: [],
            };

            mockAction = undoAction();
            actualState = preCombinedReducer(mockState, mockAction);
            expect(actualState).toBe(mockState);
        });
    });

    describe("#REDO", () => {
        it("should move data to current from past", () => {
          mockState = {
              data: "MOCK-DATA-2",
              pastData: ["MOCK-DATA-1"],
              futureData: ["MOCK-DATA-3", "MOCK-DATA-0"],
          };

          mockAction = redoAction();
          actualState = preCombinedReducer(mockState, mockAction);

          expect(actualState).toEqual({
              data: "MOCK-DATA-0",
              pastData: ["MOCK-DATA-1", "MOCK-DATA-2"],
              futureData: ["MOCK-DATA-3"],
          });
        });

        it("should return original state if no past data", () => {
            mockState = {
                data: "MOCK-DATA-0",
                pastData: [],
                futureData: [],
            };

            mockAction = redoAction();
            actualState = preCombinedReducer(mockState, mockAction);
            expect(actualState).toBe(mockState);
        });
    });
});
