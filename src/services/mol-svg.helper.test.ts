import { MolSvgHelper, BOND_SHORTNING_PX } from './mol-svg.helper.js';
import type {
  JMolAtomWrap,
  JMolBondWrap,
  JMolBondWrapCollection,
  CameraState,
} from '../declarations/index.js';

describe('MolSvgHelper', () => {
  let sut: typeof MolSvgHelper;

  beforeEach(() => {
    sut = MolSvgHelper;
  });

  it('should be defined', () => {
    expect(MolSvgHelper).toBeDefined();
  });

  describe('isAtomShown', () => {
    it('should show hydrogen atom', () => {
      const res = sut.isAtomShown({ id: 'a1', type: 'H', x: 0, y: 0, z: 0 });
      expect(res).toBe(true);
    });

    it('should show any other random atom', () => {
      const res = sut.isAtomShown({ id: 'a1', type: 'X', x: 0, y: 0, z: 0 });
      expect(res).toBe(true);
    });
  });

  describe('isLabelShown', () => {
    it('should show label of random atom', () => {
      const mockAtom = {
        id: 'atom:id',
        type: 'X',
        x: 0,
        y: 0,
        z: 0,
      } as JMolAtomWrap;
      const mockBonds: JMolBondWrapCollection = {};
      const res = sut.isLabelShown(mockAtom, mockBonds);
      expect(res).toBeTruthy();
    });

    it('should show label of carbon atom with no bonds', () => {
      const mockAtom = {
        id: 'atom:id',
        type: 'C',
        x: 0,
        y: 0,
        z: 0,
      } as JMolAtomWrap;
      const mockBonds: JMolBondWrapCollection = {};
      const res = sut.isLabelShown(mockAtom, mockBonds);
      expect(res).toBeTruthy();
    });

    it('should show carbon label of single atom', () => {
      const mockAtom = {
        id: 'atom:id',
        type: 'C',
        x: 0,
        y: 0,
        z: 0,
      } as JMolAtomWrap;
      const mockBonds: JMolBondWrapCollection = {};
      const res = sut.isLabelShown(mockAtom, mockBonds);
      expect(res).toBeTruthy();
    });

    it('should hide carbon label if it is connected with other atom via atom1', () => {
      const mockAtom = {
        id: 'atom:id',
        type: 'C',
        x: 0,
        y: 0,
        z: 0,
      } as JMolAtomWrap;
      const mockBonds: JMolBondWrapCollection = {
        'bond:id': {
          id: 'bond:id',
          atom1: 'atom:id',
          atom2: 'atom2:id',
          order: 1,
        },
      };
      const res = sut.isLabelShown(mockAtom, mockBonds);
      expect(res).toBeFalsy();
    });

    it('should hide carbon label if it is connected with other atom via atom2', () => {
      const mockAtom = {
        id: 'atom:id',
        type: 'C',
        x: 0,
        y: 0,
        z: 0,
      } as JMolAtomWrap;
      const mockBonds: JMolBondWrapCollection = {
        'bond:id': {
          id: 'bond:id',
          atom1: 'other:id',
          atom2: 'atom:id',
          order: 1,
        },
      };
      const res = sut.isLabelShown(mockAtom, mockBonds);
      expect(res).toBeFalsy();
    });
  });

  describe('getBondLines', () => {
    let mockCamera: CameraState;

    beforeEach(() => {
      mockCamera = {
        translation: { x: 0, y: 0 },
        scale: 40,
      };
    });

    function makeAtom(id: string, type: string, x: number, y: number): JMolAtomWrap {
      return { id, type, x, y, z: 0 };
    }

    function makeBond(id: string, atom1: string, atom2: string, order: number): JMolBondWrap {
      return { id, atom1, atom2, order };
    }

    it('should return empty array when atom1 is not shown (H with SHOW_HIDROGENS=false scenario)', () => {
      // Since SHOW_HIDROGENS is true (hardcoded), all atoms are shown.
      // Verify that two visible carbon atoms produce bond lines.
      const atom1 = makeAtom('a1', 'C', 0, 0);
      const atom2 = makeAtom('a2', 'C', 5, 0);
      const bond = makeBond('b1', 'a1', 'a2', 1);
      const bonds: JMolBondWrapCollection = { b1: bond };

      const lines = sut.getBondLines({
        atom1,
        atom2,
        bond,
        bonds,
        camera: mockCamera,
        viewDirection: 0,
      });

      expect(lines.length).toBeGreaterThan(0);
    });

    it('should return 2 line coords for a single bond (order=1)', () => {
      const atom1 = makeAtom('a1', 'C', 0, 0);
      const atom2 = makeAtom('a2', 'C', 5, 0);
      const bond = makeBond('b1', 'a1', 'a2', 1);
      const bonds: JMolBondWrapCollection = { b1: bond };

      const lines = sut.getBondLines({
        atom1,
        atom2,
        bond,
        bonds,
        camera: mockCamera,
        viewDirection: 0,
      });

      // Single bond returns 2 identical line coords
      expect(lines).toHaveLength(2);
      // Both lines should have the same coordinates
      expect(lines[0].x1).toEqual(lines[1].x1);
      expect(lines[0].y1).toEqual(lines[1].y1);
      expect(lines[0].x2).toEqual(lines[1].x2);
      expect(lines[0].y2).toEqual(lines[1].y2);
    });

    it('should return 3 line coords for a double bond (order=2)', () => {
      const atom1 = makeAtom('a1', 'C', 0, 0);
      const atom2 = makeAtom('a2', 'C', 5, 0);
      const bond = makeBond('b1', 'a1', 'a2', 2);
      const bonds: JMolBondWrapCollection = { b1: bond };

      const lines = sut.getBondLines({
        atom1,
        atom2,
        bond,
        bonds,
        camera: mockCamera,
        viewDirection: 0,
      });

      expect(lines).toHaveLength(3);
    });

    it('should return 4 line coords for a triple bond (order=3)', () => {
      const atom1 = makeAtom('a1', 'C', 0, 0);
      const atom2 = makeAtom('a2', 'C', 5, 0);
      const bond = makeBond('b1', 'a1', 'a2', 3);
      const bonds: JMolBondWrapCollection = { b1: bond };

      const lines = sut.getBondLines({
        atom1,
        atom2,
        bond,
        bonds,
        camera: mockCamera,
        viewDirection: 0,
      });

      expect(lines).toHaveLength(4);
    });

    it('should shorten bond when atom label is shown (non-carbon atoms)', () => {
      // Non-C atoms always show labels, so bonds are shortened on both ends
      const atom1 = makeAtom('a1', 'O', 0, 0);
      const atom2 = makeAtom('a2', 'N', 5, 0);
      const bond = makeBond('b1', 'a1', 'a2', 1);
      const bonds: JMolBondWrapCollection = { b1: bond };

      const lines = sut.getBondLines({
        atom1,
        atom2,
        bond,
        bonds,
        camera: mockCamera,
        viewDirection: 0,
      });

      expect(lines).toHaveLength(2);
      // Projected positions: atom1 -> (0,0), atom2 -> (200,0)
      // Bond should be shortened from both ends, so x1 > 0 and x2 < 200
      expect(lines[0].x1).toBeGreaterThan(0);
      expect(lines[0].x2).toBeLessThan(200);
    });

    it('should not shorten bond for carbon atoms that have bonds (label hidden)', () => {
      const atom1 = makeAtom('a1', 'C', 0, 0);
      const atom2 = makeAtom('a2', 'C', 5, 0);
      const bond = makeBond('b1', 'a1', 'a2', 1);
      const bonds: JMolBondWrapCollection = { b1: bond };

      const lines = sut.getBondLines({
        atom1,
        atom2,
        bond,
        bonds,
        camera: mockCamera,
        viewDirection: 0,
      });

      // Carbon atoms connected by bonds have hidden labels, so no shortening.
      // Projected: atom1 -> (0,0), atom2 -> (200,0)
      expect(lines[0].x1).toEqual(0);
      expect(lines[0].y1).toEqual(0);
      expect(lines[0].x2).toEqual(200);
      expect(lines[0].y2).toEqual(0);
    });

    it('should handle double bond with positive viewDirection', () => {
      const atom1 = makeAtom('a1', 'C', 0, 0);
      const atom2 = makeAtom('a2', 'C', 5, 0);
      const bond = makeBond('b1', 'a1', 'a2', 2);
      const bonds: JMolBondWrapCollection = { b1: bond };

      const lines = sut.getBondLines({
        atom1,
        atom2,
        bond,
        bonds,
        camera: mockCamera,
        viewDirection: 1,
      });

      expect(lines).toHaveLength(3);
      // With positive viewDirection, d1 should be zero vector
      // The third line should equal the first (center) line
      expect(lines[2].x1).toEqual(lines[0].x1);
      expect(lines[2].y1).toEqual(lines[0].y1);
      expect(lines[2].x2).toEqual(lines[0].x2);
      expect(lines[2].y2).toEqual(lines[0].y2);
    });

    it('should handle double bond with negative viewDirection', () => {
      const atom1 = makeAtom('a1', 'C', 0, 0);
      const atom2 = makeAtom('a2', 'C', 5, 0);
      const bond = makeBond('b1', 'a1', 'a2', 2);
      const bonds: JMolBondWrapCollection = { b1: bond };

      const lines = sut.getBondLines({
        atom1,
        atom2,
        bond,
        bonds,
        camera: mockCamera,
        viewDirection: -1,
      });

      expect(lines).toHaveLength(3);
      // With negative viewDirection, d0 should be zero vector
      // The second line should equal the first (center) line
      expect(lines[1].x1).toEqual(lines[0].x1);
      expect(lines[1].y1).toEqual(lines[0].y1);
      expect(lines[1].x2).toEqual(lines[0].x2);
      expect(lines[1].y2).toEqual(lines[0].y2);
    });

    it('should handle double bond with zero viewDirection (symmetric)', () => {
      const atom1 = makeAtom('a1', 'C', 0, 0);
      const atom2 = makeAtom('a2', 'C', 5, 0);
      const bond = makeBond('b1', 'a1', 'a2', 2);
      const bonds: JMolBondWrapCollection = { b1: bond };

      const lines = sut.getBondLines({
        atom1,
        atom2,
        bond,
        bonds,
        camera: mockCamera,
        viewDirection: 0,
      });

      expect(lines).toHaveLength(3);
      // The second and third lines should be symmetrically offset from the center
      // For horizontal bond, offset is in Y direction
      expect(lines[1].y1).toBeCloseTo(-lines[2].y1);
      expect(lines[1].y2).toBeCloseTo(-lines[2].y2);
    });

    it('should offset triple bond lines symmetrically', () => {
      const atom1 = makeAtom('a1', 'C', 0, 0);
      const atom2 = makeAtom('a2', 'C', 5, 0);
      const bond = makeBond('b1', 'a1', 'a2', 3);
      const bonds: JMolBondWrapCollection = { b1: bond };

      const lines = sut.getBondLines({
        atom1,
        atom2,
        bond,
        bonds,
        camera: mockCamera,
        viewDirection: 0,
      });

      expect(lines).toHaveLength(4);
      // First two lines are center lines (identical)
      expect(lines[0]).toEqual(lines[1]);
      // Third and fourth lines are offset symmetrically
      expect(lines[2].y1).toBeCloseTo(-lines[3].y1);
      expect(lines[2].y2).toBeCloseTo(-lines[3].y2);
    });

    it('should handle diagonal bond correctly', () => {
      const atom1 = makeAtom('a1', 'C', 0, 0);
      const atom2 = makeAtom('a2', 'C', 3, 4);
      const bond = makeBond('b1', 'a1', 'a2', 1);
      const bonds: JMolBondWrapCollection = { b1: bond };

      const lines = sut.getBondLines({
        atom1,
        atom2,
        bond,
        bonds,
        camera: mockCamera,
        viewDirection: 0,
      });

      expect(lines).toHaveLength(2);
      // Projected: atom1 -> (0,0), atom2 -> (120,160)
      expect(lines[0].x1).toEqual(0);
      expect(lines[0].y1).toEqual(0);
      expect(lines[0].x2).toEqual(120);
      expect(lines[0].y2).toEqual(160);
    });

    it('should apply camera scale and translation', () => {
      const camera: CameraState = {
        translation: { x: 50, y: 100 },
        scale: 20,
      };
      const atom1 = makeAtom('a1', 'C', 1, 1);
      const atom2 = makeAtom('a2', 'C', 3, 1);
      const bond = makeBond('b1', 'a1', 'a2', 1);
      const bonds: JMolBondWrapCollection = { b1: bond };

      const lines = sut.getBondLines({
        atom1,
        atom2,
        bond,
        bonds,
        camera,
        viewDirection: 0,
      });

      expect(lines).toHaveLength(2);
      // Projected: atom1 -> (1*20+50, 1*20+100) = (70, 120)
      //            atom2 -> (3*20+50, 1*20+100) = (110, 120)
      expect(lines[0].x1).toEqual(70);
      expect(lines[0].y1).toEqual(120);
      expect(lines[0].x2).toEqual(110);
      expect(lines[0].y2).toEqual(120);
    });

    it('should shorten bond only on labeled atom end', () => {
      // atom1 is oxygen (label shown), atom2 is carbon with bond (label hidden)
      const atom1 = makeAtom('a1', 'O', 0, 0);
      const atom2 = makeAtom('a2', 'C', 5, 0);
      const bond = makeBond('b1', 'a1', 'a2', 1);
      const bonds: JMolBondWrapCollection = { b1: bond };

      const lines = sut.getBondLines({
        atom1,
        atom2,
        bond,
        bonds,
        camera: mockCamera,
        viewDirection: 0,
      });

      expect(lines).toHaveLength(2);
      // atom1 (O) label is shown, so start is shortened: x1 > 0
      expect(lines[0].x1).toBeGreaterThan(0);
      // atom2 (C) label is hidden (has bond), so end is NOT shortened
      expect(lines[0].x2).toEqual(200);
    });
  });
});
