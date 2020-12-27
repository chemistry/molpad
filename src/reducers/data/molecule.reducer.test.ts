import {
   clearAllAction,
   loadMoleculeAction,
} from "../../actions";
import { moleculeReducer } from "./molecule.reducer";

describe("molecule reducers", () => {
    const sut = moleculeReducer;
    let actualState;
    let mockAction;
    let mockState: any;

    it("should be defined", () => {
        expect(sut).toBeDefined();
    });

    it("should return initiall state for unknown action", () => {
        mockState = { mock: "MOCK-STATE" } as any;
        mockAction = { type: "UNKNOWN-ACTION" } as any;
        actualState = moleculeReducer(mockState, mockAction);

        expect(actualState).toEqual(mockState);
    });

    it("should set molecule on load action", () => {
        mockState = {  } as any;
        const mockMolecule = {
            atoms: [[0, 0, 0, "C"]],
            bonds: [],
            id: "MOCK-ID",
            title: "MOCK-NAME",
        } as any;
        mockAction = loadMoleculeAction(mockMolecule);
        actualState = moleculeReducer(mockState, mockAction);

        expect(actualState).toEqual({
            atoms: jasmine.anything(),
            bonds: jasmine.anything(),
            id: mockMolecule.id,
            title: mockMolecule.title,
        } as any);
    });

    it("should clear molecules on clear All action", () => {
        mockState = {  } as any;

        mockAction = clearAllAction();
        actualState = moleculeReducer(mockState, mockAction);

        expect(actualState).toEqual({ atoms: {}, bonds: {}, id: "", title: "" });
    });
});
