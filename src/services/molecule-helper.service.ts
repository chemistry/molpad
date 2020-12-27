import {
    CameraState,
} from "../declarations";

import {
    JMol,
    JMolAtom,
    JMolAtomWrap,
    JMolAtomWrapCollection,
    JMolBond,
    JMolBondWrap,
    JMolBondWrapCollection,
    JMolWrapModel,
} from "../declarations";

const cloneDeep = require("lodash.clonedeep");
const uniqueId = require("lodash.uniqueid");

export class MoleculeHelperService {

    public static normalizeJmol(jmol: JMol): JMol {
        let atoms = jmol.atoms;
        const bonds = jmol.bonds;
        const newBonds: JMolBond[] = bonds.map((bond: JMolBond) => {
            const newBond = bond.slice(0) as JMolBond;
            if (bond[0] > bond[1]) {
                newBond[0] = bond[1];
                newBond[1] = bond[0];
            }
            return newBond;
        });
        const bondLength = bonds.map((bond: JMolBond) => {
            const atom1 = atoms[bond[0] - 1];
            const atom2 = atoms[bond[1] - 1];
            const dx = (atom1[0] - atom2[0]);
            const dy = (atom1[1] - atom2[1]);
            return Math.sqrt(dx * dx + dy * dy);
        });

        let bondLengthAvg = 1;
        if (bondLength.length > 0) {
            const bondLengthSum = bondLength.reduce((a, b) => a + b);
            bondLengthAvg = bondLengthSum / bonds.length;
        }

        atoms = atoms.map((atom) => {
            const newAtom = atom.slice(0) as JMolAtom;
            const m = atom[0];
            newAtom[0] = atom[0] / bondLengthAvg;
            newAtom[1] = atom[1] / bondLengthAvg;
            return newAtom;
        });
        let newAtoms: JMolAtom[] = atoms;

        if (atoms.length > 0) {
            const sumCoords = atoms.reduce(({x, y}, atom) => {
                return {
                    x: x + atom[0],
                    y: y + atom[1],
                };
            }, { x: 0, y: 0 });
            let center = { x: 0, y: 0};
            if (atoms.length > 0) {
                center = {
                    x: sumCoords.x / atoms.length,
                    y: sumCoords.y / atoms.length,
                };
            }
            newAtoms = atoms.map((atom: JMolAtom) => {
                const newAtom = atom.slice(0) as JMolAtom;
                const m = atom[0];
                newAtom[0] = atom[0] - center.x;
                newAtom[1] = atom[1] - center.y;
                return newAtom;
            });
        }

        return {
          ...jmol,
          atoms: newAtoms,
          bonds: newBonds,
        };

    }

    public static wrapMolecule(molecule: JMol): JMolWrapModel {
        const atoms = molecule.atoms;
        const wrapedAtoms = molecule.atoms.map(MoleculeHelperService.wrapAtom);
        return {
            id: molecule.id,
            title: molecule.title,
            atoms: MoleculeHelperService.wrapAtomList(wrapedAtoms),
            bonds: MoleculeHelperService.wrapBondList(molecule.bonds, wrapedAtoms),
        };
    }

    public static unWrapMolecule(molecule: JMolWrapModel): JMol | void {
        const atoms = molecule.atoms;
        const bonds = molecule.bonds;
        const atomIdsToUnWrap = Object.keys(atoms);

        return {
            id: molecule.id,
            title: molecule.title,
            atoms: atomIdsToUnWrap.map((atomId) => {
               return MoleculeHelperService.unWrapAtom(atoms[atomId]);
            }),
            bonds: Object.keys(bonds).map((bondId) => {
               return MoleculeHelperService.unWrapBond(bonds[bondId], atomIdsToUnWrap);
            }),
        };
    }

    public static createAtom({ x, y, z, type }: { x: number, y: number, z: number, type: string }): JMolAtomWrap {
        return MoleculeHelperService.wrapAtom([x, y, z, type]);
    }

    public static createBond(atom1: JMolAtomWrap, atom2: JMolAtomWrap, order: number): JMolBondWrap {
        return MoleculeHelperService.getWrapedBond(atom1.id, atom2.id, order);
    }

    private static wrapAtomList(atoms: JMolAtomWrap[]): JMolAtomWrapCollection {
        return atoms.reduce((acc, wraped: JMolAtomWrap) => {
            acc[wraped.id] = wraped;
            return acc;
        }, {} as JMolAtomWrapCollection);
    }

    private static wrapAtom(atom: JMolAtom): JMolAtomWrap {
        const id = uniqueId("atom:");
        return {
            id,
            x: atom[0],
            y: atom[1],
            z: atom[2],
            type: atom[3],
        };
    }

    private static wrapBondList(bonds: JMolBond[], atomsWraped: JMolAtomWrap[]): JMolBondWrapCollection {
        return bonds.reduce((acc, curr: JMolBond) => {
            const wraped = MoleculeHelperService.wrapBond(curr, atomsWraped);
            acc[wraped.id] = wraped;
            return acc;
        }, {} as JMolBondWrapCollection);
    }

    private static getWrapedBond(atom1: string, atom2: string, order: number): JMolBondWrap {
        const id = uniqueId("bond:");
        return {
            id,
            atom1,
            atom2,
            order,
        };
    }

    private static wrapBond(bond: JMolBond, atomsWraped: JMolAtomWrap[]): JMolBondWrap {
        const atom1Id  = atomsWraped[bond[0] - 1].id;
        const atom2Id =  atomsWraped[bond[1] - 1].id;
        return MoleculeHelperService.getWrapedBond(atom1Id, atom2Id, bond[2]);
    }

    private static unWrapAtom(atom: JMolAtomWrap): JMolAtom {
        return [
            atom.x,
            atom.y,
            atom.z,
            atom.type,
        ];
    }

    private static unWrapBond(bond: JMolBondWrap, atomIdsToUnWrap: string[]): JMolBond {
        const atom1Idx = atomIdsToUnWrap.indexOf(bond.atom1) + 1;
        const atom12dx = atomIdsToUnWrap.indexOf(bond.atom2) + 1;

        return [
            atom1Idx,
            atom12dx,
            bond.order,
        ];
    }

}
