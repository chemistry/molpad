import { cameraReducer } from "./cameta.reducer";

describe("cameraReducer", () => {
    const sut = cameraReducer;

    it("should be defined", () => {
        expect(sut).toBeDefined();
    });
});
