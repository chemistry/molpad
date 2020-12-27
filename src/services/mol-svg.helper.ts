import {
    CameraState,
    JMolAtomWrap,
    JMolBondWrap,
    JMolBondWrapCollection,
    Vec2,
} from "../declarations";
import {
    CameraHelperService,
} from "./camera-helper.service";

const ATOM_FONT_SIZE = 14;

// Show / hide config
const SHOW_HIDROGENS = true;
const SHOW_CARBONE_LABEL = false;

export const BOND_SHORTNING_PX = 14;
const BOND_MIN_LENGTH = 6;
const BOND_SLICE_DX = 4;

const EPSILON = 0.0001;

export interface LineCoords {
   x1: number;
   y1: number;
   x2: number;
   y2: number;
}

export class MolSvgHelper {
    public static isAtomShown(atom: JMolAtomWrap) {
        if (!SHOW_HIDROGENS && atom.type === "H") {
            return false;
        }
        return true;
    }

    public static isLabelShown(atom: JMolAtomWrap, bonds: JMolBondWrapCollection) {
        if (!SHOW_CARBONE_LABEL && atom.type === "C") {
            const atomId = atom.id;
            const hasAtomBonds = Object.keys(bonds).some((bondId) => {
                const bond: JMolBondWrap = bonds[bondId];
                return (bond.atom1 === atomId ||
                  bond.atom2 === atomId);
            });
            return !hasAtomBonds;
        }
        return true;
    }

    public static getBondLines({
        atom1,
        atom2,
        bond,
        bonds,
        camera,
        viewDirection,
    }: {
      atom1: JMolAtomWrap,
      atom2: JMolAtomWrap,
      bond: JMolBondWrap,
      bonds: JMolBondWrapCollection,
      camera: CameraState,
      viewDirection: number,
    }): LineCoords[] {
        if (!MolSvgHelper.isAtomShown(atom1) || !MolSvgHelper.isAtomShown(atom2)) {
            return [];
        }

        const project = CameraHelperService.project.bind(null, camera);
        const start = project({ x: atom1.x, y: atom1.y });
        const end = project({ x: atom2.x, y: atom2.y });
        const mid = ({x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 });

        let newStart = start;
        if (MolSvgHelper.isLabelShown(atom1, bonds)) {
            newStart = MolSvgHelper.shortenBond({start, end: mid, factor: 1 });
        }
        let newEnd = end;
        if (MolSvgHelper.isLabelShown(atom2, bonds)) {
            newEnd = MolSvgHelper.shortenBond({start: end, end: mid, factor: 1 });
        }

        if (bond.order === 2) {
            return MolSvgHelper.getDoubleBond({
                start: newStart,
                end: newEnd,
                viewDirection,
            });
        }

        if (bond.order === 3) {
            return MolSvgHelper.getTripleBond({
                start: newStart,
                end: newEnd,
            });
        }

        return MolSvgHelper.getSingleBond({
            start: newStart,
            end: newEnd,
        });
    }

    private static getSingleBond({ start, end }: {start: Vec2, end: Vec2}): LineCoords[] {
        return [{
            x1: start.x,
            y1: start.y,
            x2: end.x,
            y2: end.y,
        }, {
            x1: start.x,
            y1: start.y,
            x2: end.x,
            y2: end.y,
        }];
    }

    private static getDoubleBond({ start, end, viewDirection }: {start: Vec2, end: Vec2, viewDirection: number}): LineCoords[] {
        const dx = start.x - end.x;
        const dy = start.y - end.y;
        const length = Math.sqrt(dx * dx + dy * dy);

        let d0 = { x: (dy * BOND_SLICE_DX / length), y: (-dx * BOND_SLICE_DX / length) };
        let d1 = d0;
        if (viewDirection > 0) {
            d0 = { x: d0.x * 2, y: d0.y * 2 };
            d1 = { x: 0, y: 0};
        }
        if (viewDirection < 0) {
            d1 = { x: d0.x * 2, y: d0.y * 2 };
            d0 = { x: 0, y: 0};
        }

        return [{
            x1: start.x,
            y1: start.y,
            x2: end.x,
            y2: end.y,
        }, {
            x1: start.x - d0.x,
            y1: start.y - d0.y,
            x2: end.x - d0.x,
            y2: end.y - d0.y,
        }, {
            x1: start.x + d1.x,
            y1: start.y + d1.y,
            x2: end.x + d1.x,
            y2: end.y + d1.y,
        }];
    }

    private static getTripleBond({ start, end }: {start: Vec2, end: Vec2}): LineCoords[] {
        const dx = start.x - end.x;
        const dy = start.y - end.y;
        const length = Math.sqrt(dx * dx + dy * dy);

        const dO = { x: (dy * BOND_SLICE_DX / length), y: (-dx * BOND_SLICE_DX / length) };

        return [{
            x1: start.x,
            y1: start.y,
            x2: end.x,
            y2: end.y,
        }, {
            x1: start.x,
            y1: start.y,
            x2: end.x,
            y2: end.y,
        }, {
            x1: start.x - dO.x,
            y1: start.y - dO.y,
            x2: end.x - dO.x,
            y2: end.y - dO.y,
        }, {
            x1: start.x + dO.x,
            y1: start.y + dO.y,
            x2: end.x + dO.x,
            y2: end.y + dO.y,
        }];
    }

    private static shortenBond({start, end, factor }: {start: Vec2, end: Vec2, factor: number }): Vec2 {
        const dx = start.x - end.x;
        const dy = start.y - end.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        if (length < BOND_MIN_LENGTH) {
            return {
                x: start.x,
                y: start.y,
            };
        }
        const decrFactor = (length - (BOND_SHORTNING_PX * factor)) / length;

        return {
            x: (start.x - end.x) * decrFactor + end.x,
            y: (start.y - end.y) * decrFactor + end.y,
        };
    }
}
