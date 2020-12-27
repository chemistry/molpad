import {
    mouseDownAction,
    mouseMoveAction,
    mouseUpAction,
} from "../../actions";
import {
    ToolMode,
} from "../../declarations";
import { clearCommandsReducer } from "./clear.commands";

describe("clearCommandsReducer", () => {
    it("should be defined", () => {
        expect(clearCommandsReducer).toBeDefined();
    });

    let mockState: any;

    beforeEach(() => {
        mockState = {
          toolbar: { mode: ToolMode.clear, type: "1" },
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
                    },
                    "atom:2": {
                        id: "atom:2",
                        x: -1,
                        y: 1,
                        z: 0,
                    },
                    "atom:3": {
                        id: "atom:3",
                        x: 1,
                        y: 1,
                        z: 0,
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
        const actualState = clearCommandsReducer(mockState, action);

        expect(actualState).toEqual(mockState);
    });

    describe("#USECASE: user click outside of molecule", () => {
        it("it should not affect state id user click outside of molecule", () => {
            // MouseDown
            const action = mouseDownAction(600, 600);
            const actualState = clearCommandsReducer(mockState, action);

            expect(actualState).toEqual(mockState);
        });
    });

    describe("#USECASE: user click on atom", () => {
        it("should remove atom with bond when user click on it", () => {
            // MouseDown
            const action = mouseDownAction(101, 101);
            const actualState = clearCommandsReducer(mockState, action);

            const atomIds = Object.keys(actualState.data.molecule.atoms);
            const bondIds = Object.keys(actualState.data.molecule.bonds);
            expect(atomIds).toEqual(["atom:1", "atom:2"]);
            expect(bondIds).toEqual(["bond:1"]);
        });

        it("should save history record", () => {
            const action = mouseDownAction(101, 101);
            const actualState = clearCommandsReducer(mockState, action);

            expect(actualState.pastData).toEqual([mockState.data]);
        });
    });

    describe("#USECASE: click on bond", () => {
        it("should remove bond with connected atoms", () => {
            // MouseDown
            const action = mouseDownAction(0, 101);
            const actualState = clearCommandsReducer(mockState, action);

            const atomIds = Object.keys(actualState.data.molecule.atoms);
            const bondIds = Object.keys(actualState.data.molecule.bonds);
            expect(atomIds).toEqual(["atom:1", "atom:2"]);
            expect(bondIds).toEqual(["bond:1"]);
        });

        it("should remove bond with connected atoms", () => {
            // MouseDown
            const action = mouseDownAction(-100, 0);
            const actualState = clearCommandsReducer(mockState, action);

            const atomIds = Object.keys(actualState.data.molecule.atoms);
            const bondIds = Object.keys(actualState.data.molecule.bonds);
            expect(atomIds).toEqual(["atom:2", "atom:3"]);
            expect(bondIds).toEqual(["bond:2"]);
        });
    });
});
