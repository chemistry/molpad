import {
    mouseDownAction,
    mouseMoveAction,
    mouseUpAction,
    zoomOutAction,
} from "../../actions";
import {
    ToolMode,
} from "../../declarations";
import { bondCommandsReducer } from "./bond.commands";

describe("bondCommandsReducer", () => {
    it("should be defined", () => {
        expect(bondCommandsReducer).toBeDefined();
    });

    let mockState: any;

    beforeEach(() => {
        mockState = {
          toolbar: { mode: ToolMode.bond, type: 1 },
          cursor: {
              mouseClick: false,
              mouseBegin: { x: 0, y: 0 },
              mouseCurrent: { x: 0, y: 0 },
              data: null,
          },
          data: {
              molecule: {
                  atoms: {
                    "atom:1": {
                        id: "atom:1",
                        x: -1,
                        y: -1,
                        z: 0,
                        type: "C",
                    },
                    "atom:2": {
                        id: "atom:2",
                        x: -1,
                        y: 1,
                        z: 0,
                        type: "C",
                    },
                    "atom:3": {
                        id: "atom:3",
                        x: 1,
                        y: 1,
                        z: 0,
                        type: "C",
                    },
                  },
                  bonds: {
                      "bond:1": {
                          id: "bond:1",
                          atom1: "atom:1",
                          atom2: "atom:2",
                          order: 1,
                      },
                      "bond:2": {
                          id: "bond:2",
                          atom1: "atom:2",
                          atom2: "atom:3",
                          order: 1,

                      },

                  },
                  id: "MOCK-MOLECULE",
                  title: "MOCK-MOLECULE",
              },
              camera: {
                  translation: {
                      x: 0,
                      y: 0,
                  },
                  scale: 100,
              },
          },
          pastData: [],
          futureData: [],
        };
    });

    it("should ignote other actions", () => {
        const action = zoomOutAction();
        const actualState = bondCommandsReducer(mockState, action);

        expect(actualState).toEqual(mockState);
    });

    describe("#USECASE: user click on bond", () => {
        it("should increase bond order", () => {
            mockState.toolbar.type = 2;
            mockState.cursor.mouseBegin = { x: -100, y: 0 };
            mockState.cursor.mouseCurrent = { x: -100, y: 0 };

            const action = mouseDownAction(-101, 0);
            const actualState = bondCommandsReducer(mockState, action);

            const bondOrders = [
                 actualState.data.molecule.bonds["bond:1"].order,
                 actualState.data.molecule.bonds["bond:2"].order,
            ];
            expect(bondOrders).toEqual([2, 1]);
        });

        it("should save history record", () => {
            mockState.toolbar.type = 2;
            mockState.cursor.mouseBegin = { x: -100, y: 0 };
            mockState.cursor.mouseCurrent = { x: -100, y: 0 };

            const action = mouseDownAction(101, 101);
            const actualState = bondCommandsReducer(mockState, action);

            expect(actualState.pastData).toEqual([mockState.data]);
        });
    });

});
