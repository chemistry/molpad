import {
    JMol,
    JMolAtom,
} from "../declarations";
import {
    MoleculeHelperService,
} from "./molecule-helper.service";

const BENZENE = {
   atoms: [
       [1.9050, -0.7932, 0.0000, "C"],
       [1.9050, -2.1232, 0.0000, "C"],
       [0.7531, -0.1282, 0.0000, "C"],
       [0.7531, -2.7882, 0.0000, "C"],
       [-0.3987, -0.7932, 0.0000, "C"],
       [-0.3987, -2.1232, 0.0000, "C"],
   ],
   bonds: [
       [2, 1, 1],
       [3, 1, 2],
       [4, 2, 2],
       [5, 3, 1],
       [6, 4, 1],
       [6, 5, 2],
   ],
   id: "1",
   title: "benzene",
};

describe("MoleculeHelperService", () => {
    it("should be defined", () => {
        expect(MoleculeHelperService).toBeDefined();
    });

    describe("normalizeJmol", () => {
        it("should normalize atoms bond order", () => {
            const res = MoleculeHelperService.normalizeJmol(BENZENE as JMol);
            expect(res).toEqual({
                atoms: jasmine.anything(),
                bonds: [
                  [1, 2, 1],
                  [1, 3, 2],
                  [2, 4, 2],
                  [3, 5, 1],
                  [4, 6, 1],
                  [5, 6, 2],
                ],
                id: "1",
                title: "benzene",
            }  as any);
        });

        it("should center atoms", () => {
            const res = MoleculeHelperService.normalizeJmol(BENZENE as JMol);
            const sumXY = res.atoms.reduce((acc: number, curr: JMolAtom) => {
                return acc = acc + curr[0] + curr[1];
            }, 0);
            expect(sumXY).toBeCloseTo(0);
        });
    });

    describe("wrapMolecule", () => {
        it("should set id ans title", () => {
            const res = MoleculeHelperService.wrapMolecule(BENZENE as JMol);
            expect(res).toEqual({
                id: BENZENE.id,
                title: BENZENE.title,
                atoms: jasmine.anything(),
                bonds: jasmine.anything(),
            } as any);
        });

        it("should wrap atom list", () => {
            const res = MoleculeHelperService.wrapMolecule(BENZENE as JMol);
            const atoms = res.atoms;
            const atomsList = Object.keys(atoms).map((atomId) => atoms[atomId]);

            expect(atomsList.length).toBe(BENZENE.atoms.length);
        });

        it("should wrap bond list", () => {
            const res = MoleculeHelperService.wrapMolecule(BENZENE as JMol);
            const bonds = res.bonds;
            const bondsList = Object.keys(bonds).map((bondId) => bonds[bondId]);

            expect(bondsList.length).toBe(BENZENE.bonds.length);
        });
    });

    describe("unWrapMolecule", () => {
        it("should unwrap molecue", () => {
            const benzene = MoleculeHelperService.normalizeJmol(BENZENE as JMol);
            const benzeneWraped = MoleculeHelperService.wrapMolecule(benzene);
            const benzeneUnwraped = MoleculeHelperService.unWrapMolecule(benzeneWraped);

            expect(benzeneUnwraped).toEqual(benzene);
        });
    });
});
