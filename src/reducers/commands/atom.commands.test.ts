import {
    mouseDownAction,
    mouseMoveAction,
    mouseUpAction,
} from "../../actions";
import {
    ToolMode,
} from "../../declarations";
import { atomCommandsReducer } from "./atom.commands";

describe("atomCommandsReducer", () => {
    it("should be defined", () => {
        expect(atomCommandsReducer).toBeDefined();
    });

    let mockState: any;

    beforeEach(() => {
        mockState = {
          toolbar: { mode: ToolMode.atom, type: "N" },
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
        const action = mouseUpAction(600, 600);
        const actualState = atomCommandsReducer(mockState, action);

        expect(actualState).toEqual(mockState);
    });

    describe("#USECASE: user click on atom", () => {
        it("should change atom label", () => {
            // MouseDown
            const action = mouseDownAction(101, 101);
            const actualState = atomCommandsReducer(mockState, action);

            const atomLabels = [
                 actualState.data.molecule.atoms["atom:1"].type,
                 actualState.data.molecule.atoms["atom:2"].type,
                 actualState.data.molecule.atoms["atom:3"].type,
            ];
            expect(atomLabels).toEqual(["C", "C", "N"]);
        });

        it("should save history record", () => {
            const action = mouseDownAction(101, 101);
            const actualState = atomCommandsReducer(mockState, action);

            expect(actualState.pastData).toEqual([mockState.data]);
        });
    });

    describe("#USECASE: user click on atom with same type", () => {
        it("should not save recovery point", () => {
            mockState.toolbar.type = "C";

            const action = mouseDownAction(101, 101);
            const actualState = atomCommandsReducer(mockState, action);

            expect(actualState.pastData).toEqual([]);
        });
    });
});
