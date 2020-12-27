import {
    MolSvgHelper,
} from "./mol-svg.helper";

describe("MolSvgHelper", () => {
    let sut: any;

    beforeEach(() => {
        sut = MolSvgHelper;
    });

    it("should be defined", () => {
        expect(MolSvgHelper).toBeDefined();
    });

    describe("isAtomShown", () => {
        it("should show hydrogen atom", () => {
            const res = sut.isAtomShown("H");
            expect(res).toBe(true);
        });

        it("should show any other random atom", () => {
            const res = sut.isAtomShown("X");
            expect(res).toBe(true);
        });
    });

    describe("isLabelShown", () => {

        it("should show label of random atom", () => {
            const mockAtom = {
                type: "X",
            };
            const mockBonds = {};
            const res = sut.isLabelShown(mockAtom, mockBonds);
            expect(res).toBeTruthy();
        });

        it("should show label of random atom", () => {
            const mockAtom = {
                id: "atom:id",
                type: "C",
            };
            const mockBonds = {};
            const res = sut.isLabelShown(mockAtom, mockBonds);
            expect(res).toBeTruthy();
        });

        it("should show carbon label of single atom", () => {
            const mockAtom = {
                id: "atom:id",
                type: "C",
            };
            const mockBonds = {};
            const res = sut.isLabelShown(mockAtom, mockBonds);
            expect(res).toBeTruthy();
        });

        it("should hide carbon label if it is connected with other atom", () => {
            const mockAtom = {
                id: "atom:id",
                type: "C",
            };
            const mockBonds = {
                "bond:id" : {
                    id: "bond:id",
                    atom1: "atom:id",
                    atom2: "atom2:id",
                },
            };
            const res = sut.isLabelShown(mockAtom, mockBonds);
            expect(res).toBeFalsy();
        });
    });

    describe("getBondLines", () => {
        let mockAtom1: any;
        let mockAtom2: any;
        let mockBond: any;
        let mockBonds: any;
        let mockCamera: any;

        beforeEach(() => {
          mockAtom1 = {
              id: "atom:id1",
              type: "C", x: 0, y: 0, z: 0,
          } as any;
          mockAtom2 = {
              id: "atom:id2",
              type: "C", x: 1, y: 1, z: 0,
          } as any;
          mockBond = {
              id: "bond:id",
              atom1Id: "atom:id1",
              atom2Id: "atom:id2",
              order: 1,
          } as any;
          mockBonds = {
          };
          mockBonds[mockBond.id] = mockBond;
          mockCamera = {
              translation: {
                  x: 0,
                  y: 0,
              },
              scale: 10,
          } as any;
        });

        xit("should build bond lines for single bond", () => {
            const lines = sut.getBondLines({
                atom1: mockAtom1,
                atom2: mockAtom2,
                bond: mockBond,
                bonds: mockBonds,
                camera: mockCamera,
                viewDirection: 0,
            });

            expect(lines.length).toEqual(2);
            expect(lines).toEqual([
                { x1: 0, y1: 0, x2: 10, y2: 10 },
                { x1: 0, y1: 0, x2: 10, y2: 10 },
            ]);
        });
    });

});
