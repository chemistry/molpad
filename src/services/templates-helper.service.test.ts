import {
    JMol,
} from "../declarations";
import {
    TemplatesHelperService,
} from "./templates-helper.service";

describe("TemplatesHelperService", () => {
    it("should be defined", () => {
        expect(TemplatesHelperService).toBeDefined();
    });

    describe("getTemplateById", () => {
        it("should return template provided by id", () => {
            const benzene = TemplatesHelperService.getTemplateById("benzene") as JMol;
            expect(benzene).toBeDefined();
            expect(benzene.bonds.length).toEqual(6);
        });

        it("should return undefined for wrong id", () => {
            const molecule = TemplatesHelperService.getTemplateById("UNKNOWN-NAME");
            expect(molecule).toBeUndefined();
        });

        it("should center molecule", () => {
            const benzene = TemplatesHelperService.getTemplateById("benzene") as JMol;

            const center = benzene.atoms.reduce((acc: number, atom) => {
                return acc + atom[0] + atom[1] * 10 + atom[2] * 100;
            }, 0);

            expect(center).toBeCloseTo(0);
        });
    });

    describe("shiftTemplate", () => {
        it("should shift template", () => {
            const benzene = TemplatesHelperService.getTemplateById("benzene") as JMol;

            const shifted = TemplatesHelperService.shiftTemplate(benzene, {x: 1, y: 2});

            const center = shifted.atoms.reduce((acc: number, atom) => {
                return acc + atom[0] + atom[1] * 10;
            }, 0);
            const atomsCount = benzene.atoms.length;

            expect(center).toBeCloseTo(atomsCount * 1 + atomsCount * 2 * 10);
        });
    });

    describe("adjustToBondLength", () => {
        it("should ajust molecule to bond length", () => {
            const benzene = TemplatesHelperService.getTemplateById("benzene") as JMol;
            const ajusted = TemplatesHelperService.adjustToBondLength(benzene, 2);
            const center = ajusted.atoms.reduce((acc: number, atom) => {
                return acc + atom[0] + atom[1];
            }, 0);
            expect(center).toBeCloseTo(0);
            expect(ajusted.atoms[0][0] / benzene.atoms[0][0]).toBeCloseTo(0.5);
        });
    });
});
