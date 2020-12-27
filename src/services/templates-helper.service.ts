import {
    JMol,
    JMolAtomWrap,
} from "../declarations";
import {
    MoleculeHelperService,
} from "./molecule-helper.service";
import {
    BENZENE,
    CYCLOBUTANE,
    CYCLOHEXANE,
    CYCLOPENTANE,
} from "./templates";
const cloneDeep = require("lodash.clonedeep");

const templates = [
    MoleculeHelperService.normalizeJmol(BENZENE),
    MoleculeHelperService.normalizeJmol(CYCLOBUTANE),
    MoleculeHelperService.normalizeJmol(CYCLOHEXANE),
    MoleculeHelperService.normalizeJmol(CYCLOPENTANE),
];
export class TemplatesHelperService {

    public static getTemplateById(id: string): JMol | undefined {
        const data = templates.find((template) => {
            return template.id === id;
        });
        return data ? (cloneDeep(data) as JMol) : undefined;
    }

    public static adjustToBond({ template, atom1, atom2, order }: {
        template: JMol,
        atom1: JMolAtomWrap,
        atom2: JMolAtomWrap,
        order: number,
    }) {
        let sutableBondIndex = template.bonds.findIndex((bnd) => {
              return bnd[2] === order;
        });
        sutableBondIndex = 0;

        const dx = (atom2.x - atom1.x);
        const dy = (atom2.y - atom1.y);
        const bondLength = Math.sqrt(dx * dx + dy * dy);
        let newTemplate = TemplatesHelperService.adjustToBondLength(template, bondLength);

        const bondToMatch = newTemplate.bonds[sutableBondIndex];
        let tAtom1 = newTemplate.atoms[bondToMatch[0] - 1];
        let tAtom2 = newTemplate.atoms[bondToMatch[1] - 1];

        const v1 = { x: (tAtom2[0] - tAtom1[0]), y: (tAtom2[1] - tAtom1[1]) };
        const v2 = { x: (atom2.x - atom1.x), y: (atom2.y - atom1.y) };
        const center = { x: v1.x / 2, y: v1.y / 2  };
        const angle =  Math.atan2(v2.y, v2.x) -  Math.atan2(v1.y, v1.x);
        const atomsShift2 = {
            x: (atom1.x + atom2.x) / 2  - (tAtom1[0] + tAtom2[0]) / 2,
            y: (atom1.y + atom2.y) / 2  - (tAtom1[1] + tAtom2[1]) / 2,
        };

        newTemplate = TemplatesHelperService.rootateTemplate(newTemplate, angle, atomsShift2);

        tAtom1 = newTemplate.atoms[bondToMatch[0] - 1];
        tAtom2 = newTemplate.atoms[bondToMatch[1] - 1];

        const atomsShift = {
          x: (atom1.x + atom2.x) / 2  - (tAtom1[0] + tAtom2[0]) / 2,
          y: (atom1.y + atom2.y) / 2  - (tAtom1[1] + tAtom2[1]) / 2,
        };

        newTemplate = TemplatesHelperService.shiftTemplate(newTemplate, atomsShift);

        return newTemplate;
    }

    public static shiftTemplate(template: JMol, {x, y}: {x: number, y: number}) {
        return {
            ...template,
            atoms: template.atoms.map((atom) => {
                return [atom[0] + x, atom[1] + y, atom[2], atom[3]];
            }),
        } as JMol;
    }

    public static rootateTemplate(template: JMol, angle: number, center: {x: number, y: number}) {
        return {
            ...template,
            atoms: template.atoms.map((atom) => {

                const x = atom[0];
                const y = atom[1];
                const cosO = Math.cos(angle);
                const sinO = Math.sin(angle);

                const newX = (x * cosO - y * sinO);
                const newY = (x * sinO + y * cosO);

                return [newX, newY, atom[2], atom[3]];
            }),
        } as JMol;
    }

    public static adjustToBondLength(template: JMol, l: number) {
        const bond = template.bonds[0];
        const atom1 = template.atoms[bond[0] - 1];
        const atom2 = template.atoms[bond[1] - 1];
        const dx = (atom1[0] - atom2[0]);
        const dy = (atom1[1] - atom2[1]);
        const newL = Math.sqrt(dx * dx + dy * dy);
        const scale = newL / l;

        return {
            ...template,
            atoms: template.atoms.map((atom) => {
                return [atom[0] * scale, atom[1] * scale, 0, atom[3]];
            }),
        } as JMol;
    }

    public static rootateToAjustBond(
        template: JMol,
        p1: { x: number, y: number },
        p2: { x: number, y: number },
    ) {

        return template;
    }
}
