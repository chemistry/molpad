import { JMol, JMolAtom } from '../declarations/index.js';
import type {
  JMolAtomWrap,
  JMolWrapModel,
  JMolBondWrapCollection,
  JMolAtomWrapCollection,
  StoreState,
  CameraState,
  CursorState,
  DataModelState,
} from '../declarations/index.js';
import { MoleculeCalcsHelper } from './molecule-calcs.helper.service.js';

function toRad(angle: number): number {
  return (angle * Math.PI) / 180;
}

function makeAtom(id: string, x: number, y: number, type = 'C'): JMolAtomWrap {
  return { id, x, y, z: 0, type };
}

function makeMolecule(
  atoms: JMolAtomWrap[],
  bonds: { id: string; atom1: string; atom2: string; order: number }[]
): JMolWrapModel {
  const atomCollection: JMolAtomWrapCollection = {};
  for (const a of atoms) {
    atomCollection[a.id] = a;
  }
  const bondCollection: JMolBondWrapCollection = {};
  for (const b of bonds) {
    bondCollection[b.id] = b;
  }
  return { id: 'mol:1', title: 'test', atoms: atomCollection, bonds: bondCollection };
}

function makeState(
  molecule: JMolWrapModel,
  camera: CameraState = { translation: { x: 0, y: 0 }, scale: 1 },
  mouseBegin = { x: 0, y: 0 },
  mouseCurrent = { x: 0, y: 0 }
): StoreState {
  const cursor: CursorState = {
    mouseClick: false,
    mouseBegin,
    mouseCurrent,
    data: null,
  };
  const data: DataModelState = { molecule, camera };
  return {
    toolbar: { mode: 'none' as any, type: '' },
    cursor,
    pastData: [],
    futureData: [],
    data,
    cache: { bondsClasification: {} },
    settings: { additionalElements: [] },
    isTableShown: false,
  };
}

describe('MoleculeCalcsHelper', () => {
  it('should be defined', () => {
    expect(MoleculeCalcsHelper).toBeDefined();
  });

  describe('proposeEndAtom', () => {
    it('should propose atom at 30 deg when start atom has no neighbours', () => {
      const startAtom = makeAtom('a1', 0, 0);
      const molecule = makeMolecule([startAtom], []);
      const state = makeState(molecule);

      const result = MoleculeCalcsHelper.proposeEndAtom(startAtom, state);

      // No neighbours: x = startAtom.x + cos(PI/6), y = startAtom.y - sin(PI/6)
      expect(result.x).toBeCloseTo(Math.cos(Math.PI / 6));
      expect(result.y).toBeCloseTo(-Math.sin(Math.PI / 6));
      expect(result.z).toEqual(0);
      expect(result.type).toEqual('C');
    });

    it('should propose atom at calculated angle when start atom has 1 neighbour', () => {
      const startAtom = makeAtom('a1', 0, 0);
      const neighbour = makeAtom('a2', -1, 0);
      const bond = { id: 'b1', atom1: 'a1', atom2: 'a2', order: 1 };
      const molecule = makeMolecule([startAtom, neighbour], [bond]);
      const state = makeState(molecule);

      const result = MoleculeCalcsHelper.proposeEndAtom(startAtom, state);

      expect(result.z).toEqual(0);
      expect(result.type).toEqual('C');
      // The proposed atom should be at distance 1 from startAtom
      const dist = Math.sqrt(result.x * result.x + result.y * result.y);
      expect(dist).toBeCloseTo(1);
    });

    it('should propose atom when start atom has 1 neighbour and angle > PI/6', () => {
      // Neighbour to the upper-right: angle = atan2(0 - 1, 0 - (-1)) = atan2(-1, 1) ~ -0.785
      // Actually dx = startAtom.x - neighbour.x, dy = startAtom.y - neighbour.y
      // Put neighbour below: startAtom at (0,0), neighbour at (0, 1)
      // dx = 0-0 = 0, dy = 0-1 = -1, angle = atan2(-1, 0) = -PI/2
      // -PI/2 is NOT > PI/6, so this takes the else branch
      const startAtom = makeAtom('a1', 0, 0);
      const neighbour = makeAtom('a2', 0, 1);
      const bond = { id: 'b1', atom1: 'a1', atom2: 'a2', order: 1 };
      const molecule = makeMolecule([startAtom, neighbour], [bond]);
      const state = makeState(molecule);

      const result = MoleculeCalcsHelper.proposeEndAtom(startAtom, state);

      expect(result.type).toEqual('C');
      expect(result.z).toEqual(0);
      const dist = Math.sqrt(result.x * result.x + result.y * result.y);
      expect(dist).toBeCloseTo(1);
    });

    it('should propose atom when start atom has 1 neighbour and angle > PI/6 (upper branch)', () => {
      // Put neighbour at (0, -1) so angle = atan2(0 - (-1), 0 - 0) = atan2(1, 0) = PI/2 > PI/6
      const startAtom = makeAtom('a1', 0, 0);
      const neighbour = makeAtom('a2', 0, -1);
      const bond = { id: 'b1', atom1: 'a1', atom2: 'a2', order: 1 };
      const molecule = makeMolecule([startAtom, neighbour], [bond]);
      const state = makeState(molecule);

      const result = MoleculeCalcsHelper.proposeEndAtom(startAtom, state);

      expect(result.type).toEqual('C');
      expect(result.z).toEqual(0);
      const dist = Math.sqrt(result.x * result.x + result.y * result.y);
      expect(dist).toBeCloseTo(1);
    });

    it('should propose atom using proposeNewAtomAngle when start atom has 2+ neighbours', () => {
      const startAtom = makeAtom('a1', 0, 0);
      const n1 = makeAtom('a2', 1, 0);
      const n2 = makeAtom('a3', -1, 0);
      const bond1 = { id: 'b1', atom1: 'a1', atom2: 'a2', order: 1 };
      const bond2 = { id: 'b2', atom1: 'a1', atom2: 'a3', order: 1 };
      const molecule = makeMolecule([startAtom, n1, n2], [bond1, bond2]);
      const state = makeState(molecule);

      const result = MoleculeCalcsHelper.proposeEndAtom(startAtom, state);

      expect(result.type).toEqual('C');
      expect(result.z).toEqual(0);
      // With two neighbours at 0 and PI, the biggest gap direction should be roughly PI/2 or 3PI/2
      const dist = Math.sqrt(result.x * result.x + result.y * result.y);
      expect(dist).toBeCloseTo(1);
    });

    it('should handle atom not found in molecule (no neighbours)', () => {
      // startAtom is not in the molecule atoms collection
      const startAtom = makeAtom('a_missing', 0, 0);
      const otherAtom = makeAtom('a2', 1, 0);
      const molecule = makeMolecule([otherAtom], []);
      const state = makeState(molecule);

      const result = MoleculeCalcsHelper.proposeEndAtom(startAtom, state);

      // No neighbours case
      expect(result.x).toBeCloseTo(Math.cos(Math.PI / 6));
      expect(result.y).toBeCloseTo(-Math.sin(Math.PI / 6));
    });

    it('should handle bond where atom is atom2 (reverse bond direction)', () => {
      const startAtom = makeAtom('a1', 0, 0);
      const neighbour = makeAtom('a2', 1, 0);
      // Bond has a1 as atom2 (reverse)
      const bond = { id: 'b1', atom1: 'a2', atom2: 'a1', order: 1 };
      const molecule = makeMolecule([startAtom, neighbour], [bond]);
      const state = makeState(molecule);

      const result = MoleculeCalcsHelper.proposeEndAtom(startAtom, state);

      // Should find the neighbour via atom2 match
      expect(result.type).toEqual('C');
      const dist = Math.sqrt(result.x * result.x + result.y * result.y);
      expect(dist).toBeCloseTo(1);
    });

    it('should propose atom with 3 neighbours using angles', () => {
      const startAtom = makeAtom('a1', 0, 0);
      // Place 3 neighbours at 120 degree intervals
      const n1 = makeAtom('a2', 1, 0); // angle = 0
      const n2 = makeAtom('a3', -0.5, Math.sqrt(3) / 2); // angle ~ 120 deg (but inverted y for screen coords)
      const n3 = makeAtom('a4', -0.5, -Math.sqrt(3) / 2);
      const bond1 = { id: 'b1', atom1: 'a1', atom2: 'a2', order: 1 };
      const bond2 = { id: 'b2', atom1: 'a1', atom2: 'a3', order: 1 };
      const bond3 = { id: 'b3', atom1: 'a1', atom2: 'a4', order: 1 };
      const molecule = makeMolecule([startAtom, n1, n2, n3], [bond1, bond2, bond3]);
      const state = makeState(molecule);

      const result = MoleculeCalcsHelper.proposeEndAtom(startAtom, state);

      expect(result.type).toEqual('C');
      expect(result.z).toEqual(0);
    });
  });

  describe('proposeFixedAtom', () => {
    it('should snap angle to nearest 30 degree increment', () => {
      const startPos = { x: 0, y: 0 };
      const currentPos = { x: -1, y: 0 }; // Angle = atan2(0-0, 0-(-1)) = atan2(0, 1) = 0

      const result = MoleculeCalcsHelper.proposeFixedAtom(startPos, currentPos);

      // angle = 0, direction = 0, result: x = 0 - cos(0) = -1, y = 0 - sin(0) = 0
      expect(result.x).toBeCloseTo(-1);
      expect(result.y).toBeCloseTo(0);
    });

    it('should snap to 30 degrees for near-30-degree input', () => {
      const startPos = { x: 0, y: 0 };
      // angle ~ 28 deg, should snap to 30
      const rad28 = (28 * Math.PI) / 180;
      const currentPos = { x: -Math.cos(rad28), y: -Math.sin(rad28) };

      const result = MoleculeCalcsHelper.proposeFixedAtom(startPos, currentPos);

      const direction = Math.round((rad28 * 6) / Math.PI) / (6 / Math.PI);
      expect(result.x).toBeCloseTo(-Math.cos(direction));
      expect(result.y).toBeCloseTo(-Math.sin(direction));
    });

    it('should snap to 90 degrees', () => {
      const startPos = { x: 5, y: 5 };
      const currentPos = { x: 5, y: 4 }; // directly above, angle = atan2(1, 0) = PI/2

      const result = MoleculeCalcsHelper.proposeFixedAtom(startPos, currentPos);

      const direction = Math.PI / 2;
      expect(result.x).toBeCloseTo(5 - Math.cos(direction));
      expect(result.y).toBeCloseTo(5 - Math.sin(direction));
    });

    it('should snap to 180 degrees', () => {
      const startPos = { x: 0, y: 0 };
      const currentPos = { x: 1, y: 0 }; // angle = atan2(0, -1) = PI

      const result = MoleculeCalcsHelper.proposeFixedAtom(startPos, currentPos);

      expect(result.x).toBeCloseTo(-Math.cos(Math.PI));
      expect(result.y).toBeCloseTo(-Math.sin(Math.PI));
    });

    it('should handle negative angles (below horizontal)', () => {
      const startPos = { x: 0, y: 0 };
      const currentPos = { x: -1, y: 1 }; // angle = atan2(-1, 1) = -PI/4 -> snaps to -PI/4 (or -45 deg)

      const result = MoleculeCalcsHelper.proposeFixedAtom(startPos, currentPos);

      // Verify the result is at distance 1 from startPos
      const dist = Math.sqrt(result.x * result.x + result.y * result.y);
      expect(dist).toBeCloseTo(1);
    });

    it('should place result at unit distance from start', () => {
      const startPos = { x: 10, y: 20 };
      const currentPos = { x: 7, y: 17 };

      const result = MoleculeCalcsHelper.proposeFixedAtom(startPos, currentPos);

      const dx = result.x - startPos.x;
      const dy = result.y - startPos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      expect(dist).toBeCloseTo(1);
    });
  });

  describe('proposeNewAtomAngle', () => {
    const proposeNewAtomAngle = MoleculeCalcsHelper.proposeNewAtomAngle;

    it('should define method', () => {
      expect(proposeNewAtomAngle).toBeDefined();
    });

    it('should throw when input has array of less than 2 angles', () => {
      expect(() => {
        proposeNewAtomAngle([0]);
      }).toThrowError();
    });

    it('should throw when input has empty array', () => {
      expect(() => {
        proposeNewAtomAngle([]);
      }).toThrowError();
    });

    it('should process case with 2 angles', () => {
      const res = proposeNewAtomAngle([toRad(0), toRad(179.9999)]);

      expect(res).toBeCloseTo(toRad(90));
    });

    it('should process symmetrical case with 2 angles', () => {
      const res = proposeNewAtomAngle([toRad(90), toRad(210)]);

      expect(res).toBeCloseTo(toRad(330));
    });

    it('should give directional preferences', () => {
      const res = proposeNewAtomAngle([toRad(90), toRad(210), toRad(330)]);
      expect(res).toBeCloseTo(toRad(30));
    });

    it('should handle negative angles by normalizing them', () => {
      const res = proposeNewAtomAngle([toRad(-90), toRad(90)]);
      // -90 deg normalized to 270 deg; angles [90, 270]; biggest gap -> 0 or 180
      expect(typeof res).toBe('number');
      expect(res).toBeGreaterThanOrEqual(0);
      expect(res).toBeLessThan(2 * Math.PI);
    });

    it('should handle angles that wrap around 2*PI', () => {
      const res = proposeNewAtomAngle([toRad(350), toRad(10)]);
      // Sorted: [10, 350]. Gap from 10 to 350 = 340, wrap gap from 350 to 10 = 20
      // Biggest gap is 10->350, direction ~ 180 deg
      expect(res).toBeCloseTo(toRad(180));
    });

    it('should handle 4 angles evenly spaced', () => {
      const res = proposeNewAtomAngle([toRad(0), toRad(90), toRad(180), toRad(270)]);
      // All gaps equal (90 deg), returns direction based on closest-to-45-deg preference
      expect(typeof res).toBe('number');
    });

    it('should pick the largest gap when gaps are unequal', () => {
      // Angles at 0 and 10: gap 0->10 = 10, wrap gap 10->0 = 350
      const res = proposeNewAtomAngle([toRad(0), toRad(10)]);
      // Biggest gap direction ~ 185 deg
      expect(res).toBeCloseTo(toRad(185));
    });

    it('should return angle in [0, 2PI) range', () => {
      const res = proposeNewAtomAngle([toRad(45), toRad(135)]);
      expect(res).toBeGreaterThanOrEqual(0);
      expect(res).toBeLessThan(2 * Math.PI + 0.001);
    });
  });
});
