import {
    JMolAtomWrap,
    JMolWrapModel,
    StoreState,
} from "../declarations";
import {
    CameraHelperService,
    MoleculeHelperService,
} from "./index";

export class MoleculeCalcsHelper {

    public static proposeEndAtom(startAtom: JMolAtomWrap, state: StoreState): { x: number, y: number, z: number, type: string } {
        const currentPos = state.cursor.mouseCurrent;
        const beginPos = state.cursor.mouseBegin;
        const camera = state.data.camera;
        const molecule = state.data.molecule;
        const unproject = CameraHelperService.unproject.bind(null, camera);

        const atomCoords = unproject(beginPos);

        const atomNeighbours = MoleculeCalcsHelper.getNeighbours(molecule, startAtom);
        if (atomNeighbours.length === 0) {
            const endAtomCoords1 = {
                x: startAtom.x + Math.cos(Math.PI / 6),
                y: startAtom.y - Math.sin(Math.PI / 6),
            };

            return { ...endAtomCoords1, z: 0, type: "C" };
        }

        if (atomNeighbours.length === 1) {
            const theNeighbour = atomNeighbours[0];
            const dx = startAtom.x - theNeighbour.x;
            const dy = startAtom.y - theNeighbour.y;
            const angle =  Math.atan2(dy, dx);
            let newAngle = 0;

            if (angle > (Math.PI / 6) ) {
                newAngle = angle - (Math.PI * 4 / 3) + Math.PI;
            } else {
                newAngle = angle - (Math.PI * 2 / 3) + Math.PI;
            }

            const endAtomCoords2 = {
                x: startAtom.x + Math.cos(newAngle),
                y: startAtom.y + Math.sin(newAngle),
            };

            return { ...endAtomCoords2, z: 0, type: "C" };
        }
        const atomAngles = atomNeighbours.map((atom) => {
            const dx =  atom.x - startAtom.x;
            const dy =  startAtom.y - atom.y;
            let angle =  Math.atan2(dy, dx);
            if (angle < 0) {
                angle = angle + (2 * Math.PI);
            }
            return angle;

        });

        const direction = MoleculeCalcsHelper.proposeNewAtomAngle(atomAngles);

        const endAtomCoords = {
            x: startAtom.x + Math.cos(direction),
            y: startAtom.y - Math.sin(direction),
        };

        return { ...endAtomCoords, z: 0, type: "C" };
    }

    public static proposeFixedAtom(
        startPos: {x: number, y: number },
        currentPos: {x: number, y: number },
    ) {
        const dx = startPos.x - currentPos.x;
        const dy = startPos.y - currentPos.y;
        const angle =  Math.atan2(dy, dx);
        // 12 sections factor
        const f = 6 / Math.PI;
        const direction = Math.round(angle * f) / f;

        return {
            x: startPos.x - Math.cos(direction),
            y: startPos.y - Math.sin(direction),
        };
    }

    public static proposeNewAtomAngle(angles: number[]): number {
        if (angles.length < 2) {
            throw new Error("incorrect argument length");
        }
        const sAngles = angles
          .slice(0)
          .map((ang) => {
              if (ang < 0) {
                  return ang + (2 * Math.PI);
              }
              return ang;
          })
          .sort((a, b) => a - b);
        let intervals = sAngles.map((angle1, index) => {
              let angle2;
              if (index === sAngles.length - 1) {
                    angle2 = sAngles[0];
                    const angle = (( (2 * Math.PI) - angle1) + angle2);
                    return {
                        direction:  (( angle / 2) + angle1) % (2 * Math.PI),
                        angle,
                    };
              } else {
                    angle2 = sAngles[index + 1];
                    return {
                        direction: ((angle2 + angle1) / 2) % (2 * Math.PI),
                        angle: (angle2 - angle1),
                    };
              }
        });

        intervals = intervals.sort((a, b) => b.angle - a.angle);
        const biggestAngle = intervals[0];
        const diffAgle = (intervals[intervals.length - 1].angle / 4);
        const sutableIntervals = intervals.filter((ang) => {
            return ang.angle > biggestAngle.angle - diffAgle;
        });
        function diffTo45(a: number): number {
            if (a > (5 * Math.PI / 4)) {
                return ((Math.PI / 4) + ((2 * Math.PI) - a)) % (2 * Math.PI);
            }
            return a - (Math.PI / 4);
        }
        sutableIntervals.sort((a, b) => {
            return diffTo45(a.direction) - diffTo45(b.direction);
        });
        return sutableIntervals[0].direction;
    }

    private static getNeighbours(molecule: JMolWrapModel, atom: JMolAtomWrap): JMolAtomWrap[] {
        const atomId = atom.id;
        if (!molecule.atoms[atomId]) {
            return [];
        }
        const neighbourAtomIds =
          Object.keys(molecule.bonds)
            .map((bondId) => {
                const bond = molecule.bonds[bondId];
                if (bond.atom1 === atomId) {
                    return bond.atom2;
                }
                if (bond.atom2 === atomId) {
                    return bond.atom1;
                }
                return null;
            })
            .filter((cAtomId: string | null) => {
                return cAtomId !== null;
            }) as string[];

        return neighbourAtomIds.map((cAtomId: string) => {
            return molecule.atoms[cAtomId];
        });
    }
}

function toGrad(n: number) {
    return (n / Math.PI) * 180;
}
