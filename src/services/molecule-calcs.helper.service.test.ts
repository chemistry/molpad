import {
    JMol,
    JMolAtom,
} from "../declarations";
import {
    MoleculeCalcsHelper,
} from "./molecule-calcs.helper.service";

function toRad(angle: number): number {
    return angle * Math.PI / 180;
}

describe("MoleculeCalcsHelper", () => {
    it("should be defined", () => {
        expect(MoleculeCalcsHelper).toBeDefined();
    });

    describe("proposeNewAtomAngle", () => {
        const proposeNewAtomAngle = MoleculeCalcsHelper.proposeNewAtomAngle;

        it("should define method", () => {
            expect(proposeNewAtomAngle).toBeDefined();
        });

        it("should throw then input has array of less then 2 angles", () => {
            expect(() => {
                proposeNewAtomAngle([0]);
            }).toThrowError();
        });
        it("should process case with 2 angles", () => {
            const res = proposeNewAtomAngle([toRad(0), toRad(179.9999)]);

            expect(res).toBeCloseTo(toRad(90));
        });

        it("should process symetrical case with 2 angles", () => {
            const res = proposeNewAtomAngle([toRad(90) , toRad(210)]);

            expect(res).toBeCloseTo(toRad(330));
        });

        it("should give directional prefereneces", () => {
            const res = proposeNewAtomAngle([toRad(90), toRad(210), toRad(330)]);
            expect(res).toBeCloseTo(toRad(30));
        });

    });
});
