import {
    CameraState,
    JMolAtomWrap,
    JMolBondWrap,
    JMolWrapModel,
    Vec2,
} from "../declarations";
import {
    CameraHelperService,
    MolSvgHelper,
} from "./index";

const EPSILON = 0.0001;
const ATOM_SELECTION_RADIUS = 10 + EPSILON;
const BOND_SELECTION_RADIUS = 15 + EPSILON;

export class ProjectionHelperService {

    public static getProjectionAtoms({
        position,
        camera,
        molecule,
        multR,
    }: {
        position: Vec2,
        camera: CameraState,
        molecule: JMolWrapModel,
        multR?: number,
    }): JMolAtomWrap[] {
          const mult = multR || 1;
          const selectedItem: JMolAtomWrap[] = [];

          const project = CameraHelperService.project.bind(null, camera);
          const atoms = Object.keys(molecule.atoms)
              .map((atomId) => molecule.atoms[atomId]);

          atoms.forEach((atom) => {
              if (!MolSvgHelper.isAtomShown(atom)) {
                  return;
              }

              const p = project({
                  x: atom.x,
                  y: atom.y,
              });
              const dx = Math.abs(p.x - position.x);
              const dy = Math.abs(p.y - position.y);

              if (
                  dx > (ATOM_SELECTION_RADIUS * mult) ||
                  dy > (ATOM_SELECTION_RADIUS * mult)
              ) {
                  return;
              }
              const l = Math.sqrt(dx * dx + dy * dy);
              if (l < (ATOM_SELECTION_RADIUS + EPSILON) * mult) {
                  selectedItem.push(atom);
              }
          });

          return selectedItem;
    }

    public static getProjectionAtom({
        position,
        camera,
        molecule,
        multR,
    }: {
        position: Vec2,
        camera: CameraState,
        molecule: JMolWrapModel,
        multR?: number,
    }): JMolAtomWrap | null {
        const projectionsItems = ProjectionHelperService.getProjectionAtoms({
            position,
            camera,
            molecule,
            multR,
        });

        return projectionsItems.length > 0 ? projectionsItems[0] : null;
    }

    public static getProjectionBond({
        position,
        camera,
        molecule,
    }: {
        position: Vec2,
        camera: CameraState,
        molecule: JMolWrapModel,
    }): JMolBondWrap | null {
        let selectedItem: JMolBondWrap | null = null;

        const project = CameraHelperService.project.bind(null, camera);
        const atoms = molecule.atoms;
        const bonds = Object.keys(molecule.bonds)
            .map((bondId) => molecule.bonds[bondId]);

        bonds.forEach((bond) => {
            if (selectedItem) {
                return;
            }

            const atom1 = atoms[bond.atom1];
            const atom2 = atoms[bond.atom2];
            if (!MolSvgHelper.isAtomShown(atom1) ||
            !MolSvgHelper.isAtomShown(atom2)
            ) {
                return;
            }

            const p1 = project({ x: atom1.x, y: atom1.y });
            const p2 = project({ x: atom2.x, y: atom2.y });
            const p3 = position;

            const dist = pDistance(p3.x, p3.y, p1.x, p1.y, p2.x, p2.y);
            if (dist < BOND_SELECTION_RADIUS) {
                selectedItem = bond;
            }
        });

        return selectedItem;
    }
}
// Solution base on :
// https://stackoverflow.com/questions/849211/shortest-distance-between-a-point-and-a-line-segment
function pDistance(x: number, y: number, x1: number, y1: number, x2: number, y2: number) {

  const A = x - x1;
  const B = y - y1;
  const C = x2 - x1;
  const D = y2 - y1;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  let param = -1;
  if (lenSq !== 0) /* in case of 0 length line */{
      param = dot / lenSq;
  }

  let xx;
  let yy;

  if (param < 0) {
    xx = x1;
    yy = y1;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }

  const dx = x - xx;
  const dy = y - yy;
  return Math.sqrt(dx * dx + dy * dy);
}
