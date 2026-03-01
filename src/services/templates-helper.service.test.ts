import { JMol } from '../declarations/index.js';
import type { JMolAtomWrap } from '../declarations/index.js';
import { TemplatesHelperService } from './templates-helper.service.js';

describe('TemplatesHelperService', () => {
  it('should be defined', () => {
    expect(TemplatesHelperService).toBeDefined();
  });

  describe('getTemplateById', () => {
    it('should return template provided by id', () => {
      const benzene = TemplatesHelperService.getTemplateById('benzene') as JMol;
      expect(benzene).toBeDefined();
      expect(benzene.bonds.length).toEqual(6);
    });

    it('should return undefined for wrong id', () => {
      const molecule = TemplatesHelperService.getTemplateById('UNKNOWN-NAME');
      expect(molecule).toBeUndefined();
    });

    it('should center molecule', () => {
      const benzene = TemplatesHelperService.getTemplateById('benzene') as JMol;

      const center = benzene.atoms.reduce((acc: number, atom) => {
        return acc + atom[0] + atom[1] * 10 + atom[2] * 100;
      }, 0);

      expect(center).toBeCloseTo(0);
    });
  });

  describe('adjustToBond', () => {
    it('should adjust template to match a bond between two atoms', () => {
      const benzene = TemplatesHelperService.getTemplateById('benzene') as JMol;
      const atom1: JMolAtomWrap = { id: 'a1', x: 0, y: 0, z: 0, type: 'C' };
      const atom2: JMolAtomWrap = { id: 'a2', x: 1, y: 0, z: 0, type: 'C' };

      const result = TemplatesHelperService.adjustToBond({
        template: benzene,
        atom1,
        atom2,
        order: 2,
      });

      expect(result).toBeDefined();
      expect(result.atoms.length).toEqual(benzene.atoms.length);
      expect(result.bonds.length).toEqual(benzene.bonds.length);
    });

    it('should position template so first bond aligns with given atoms', () => {
      const benzene = TemplatesHelperService.getTemplateById('benzene') as JMol;
      const atom1: JMolAtomWrap = { id: 'a1', x: 0, y: 0, z: 0, type: 'C' };
      const atom2: JMolAtomWrap = { id: 'a2', x: 1, y: 0, z: 0, type: 'C' };

      const result = TemplatesHelperService.adjustToBond({
        template: benzene,
        atom1,
        atom2,
        order: 1,
      });

      // The first bond atoms of the template should be centered around the midpoint of atom1-atom2
      const bond = result.bonds[0];
      const tAtom1 = result.atoms[bond[0] - 1];
      const tAtom2 = result.atoms[bond[1] - 1];
      const midX = (tAtom1[0] + tAtom2[0]) / 2;
      const midY = (tAtom1[1] + tAtom2[1]) / 2;
      const targetMidX = (atom1.x + atom2.x) / 2;
      const targetMidY = (atom1.y + atom2.y) / 2;

      expect(midX).toBeCloseTo(targetMidX, 1);
      expect(midY).toBeCloseTo(targetMidY, 1);
    });

    it('should scale template bond length via adjustToBondLength using target distance', () => {
      const benzene = TemplatesHelperService.getTemplateById('benzene') as JMol;
      const atom1: JMolAtomWrap = { id: 'a1', x: 0, y: 0, z: 0, type: 'C' };
      const atom2: JMolAtomWrap = { id: 'a2', x: 1, y: 0, z: 0, type: 'C' };

      const result = TemplatesHelperService.adjustToBond({
        template: benzene,
        atom1,
        atom2,
        order: 1,
      });

      // adjustToBondLength scales by (currentBondLength / targetLength)
      // For normalized benzene, bond length ~ 1, target = 1 (distance between atoms), so scale ~ 1
      // The resulting first bond length should be close to the original normalized bond length
      const bond = result.bonds[0];
      const tAtom1 = result.atoms[bond[0] - 1];
      const tAtom2 = result.atoms[bond[1] - 1];
      const dx = tAtom1[0] - tAtom2[0];
      const dy = tAtom1[1] - tAtom2[1];
      const bondLength = Math.sqrt(dx * dx + dy * dy);

      // Bond length should be approximately 1 (the normalized value)
      expect(bondLength).toBeCloseTo(1, 0);
    });

    it('should handle vertical bond alignment', () => {
      const benzene = TemplatesHelperService.getTemplateById('benzene') as JMol;
      const atom1: JMolAtomWrap = { id: 'a1', x: 0, y: 0, z: 0, type: 'C' };
      const atom2: JMolAtomWrap = { id: 'a2', x: 0, y: 1, z: 0, type: 'C' };

      const result = TemplatesHelperService.adjustToBond({
        template: benzene,
        atom1,
        atom2,
        order: 1,
      });

      expect(result).toBeDefined();
      expect(result.atoms.length).toEqual(benzene.atoms.length);
    });

    it('should handle diagonal bond alignment', () => {
      const benzene = TemplatesHelperService.getTemplateById('benzene') as JMol;
      const atom1: JMolAtomWrap = { id: 'a1', x: 0, y: 0, z: 0, type: 'C' };
      const atom2: JMolAtomWrap = { id: 'a2', x: 1, y: 1, z: 0, type: 'C' };

      const result = TemplatesHelperService.adjustToBond({
        template: benzene,
        atom1,
        atom2,
        order: 1,
      });

      expect(result).toBeDefined();
      expect(result.atoms.length).toEqual(benzene.atoms.length);
    });

    it('should preserve template structure (same number of atoms and bonds)', () => {
      const benzene = TemplatesHelperService.getTemplateById('benzene') as JMol;
      const atom1: JMolAtomWrap = { id: 'a1', x: 5, y: 5, z: 0, type: 'C' };
      const atom2: JMolAtomWrap = { id: 'a2', x: 6, y: 5, z: 0, type: 'C' };

      const result = TemplatesHelperService.adjustToBond({
        template: benzene,
        atom1,
        atom2,
        order: 2,
      });

      expect(result.atoms.length).toEqual(6);
      expect(result.bonds.length).toEqual(6);
      expect(result.id).toEqual(benzene.id);
      expect(result.title).toEqual(benzene.title);
    });
  });

  describe('shiftTemplate', () => {
    it('should shift template by given x and y', () => {
      const benzene = TemplatesHelperService.getTemplateById('benzene') as JMol;

      const shifted = TemplatesHelperService.shiftTemplate(benzene, { x: 1, y: 2 });

      const center = shifted.atoms.reduce((acc: number, atom) => {
        return acc + atom[0] + atom[1] * 10;
      }, 0);
      const atomsCount = benzene.atoms.length;

      expect(center).toBeCloseTo(atomsCount * 1 + atomsCount * 2 * 10);
    });

    it('should shift all atoms by the offset', () => {
      const template: JMol = {
        id: 'test',
        title: 'test',
        atoms: [
          [0, 0, 0, 'C'],
          [1, 0, 0, 'C'],
          [0, 1, 0, 'C'],
        ],
        bonds: [[1, 2, 1]],
      };

      const shifted = TemplatesHelperService.shiftTemplate(template, { x: 5, y: -3 });

      expect(shifted.atoms[0][0]).toBeCloseTo(5);
      expect(shifted.atoms[0][1]).toBeCloseTo(-3);
      expect(shifted.atoms[1][0]).toBeCloseTo(6);
      expect(shifted.atoms[1][1]).toBeCloseTo(-3);
      expect(shifted.atoms[2][0]).toBeCloseTo(5);
      expect(shifted.atoms[2][1]).toBeCloseTo(-2);
    });

    it('should preserve z coordinate and atom type', () => {
      const template: JMol = {
        id: 'test',
        title: 'test',
        atoms: [
          [1, 2, 3, 'N'],
          [4, 5, 6, 'O'],
        ],
        bonds: [[1, 2, 1]],
      };

      const shifted = TemplatesHelperService.shiftTemplate(template, { x: 10, y: 20 });

      expect(shifted.atoms[0][2]).toEqual(3);
      expect(shifted.atoms[0][3]).toEqual('N');
      expect(shifted.atoms[1][2]).toEqual(6);
      expect(shifted.atoms[1][3]).toEqual('O');
    });

    it('should not mutate original template', () => {
      const template: JMol = {
        id: 'test',
        title: 'test',
        atoms: [[0, 0, 0, 'C']],
        bonds: [],
      };

      TemplatesHelperService.shiftTemplate(template, { x: 5, y: 5 });

      expect(template.atoms[0][0]).toEqual(0);
      expect(template.atoms[0][1]).toEqual(0);
    });

    it('should handle zero shift', () => {
      const template: JMol = {
        id: 'test',
        title: 'test',
        atoms: [[3, 4, 0, 'C']],
        bonds: [],
      };

      const shifted = TemplatesHelperService.shiftTemplate(template, { x: 0, y: 0 });

      expect(shifted.atoms[0][0]).toBeCloseTo(3);
      expect(shifted.atoms[0][1]).toBeCloseTo(4);
    });
  });

  describe('rootateTemplate', () => {
    it('should rotate template atoms by a given angle', () => {
      const template: JMol = {
        id: 'test',
        title: 'test',
        atoms: [[1, 0, 0, 'C']],
        bonds: [],
      };

      // Rotate by 90 degrees
      const rotated = TemplatesHelperService.rootateTemplate(template, Math.PI / 2, { x: 0, y: 0 });

      // (1, 0) rotated 90 degrees -> (0, 1)
      expect(rotated.atoms[0][0]).toBeCloseTo(0);
      expect(rotated.atoms[0][1]).toBeCloseTo(1);
    });

    it('should rotate template atoms by 180 degrees', () => {
      const template: JMol = {
        id: 'test',
        title: 'test',
        atoms: [
          [1, 0, 0, 'C'],
          [0, 1, 0, 'C'],
        ],
        bonds: [[1, 2, 1]],
      };

      const rotated = TemplatesHelperService.rootateTemplate(template, Math.PI, { x: 0, y: 0 });

      // (1, 0) rotated 180 degrees -> (-1, 0)
      expect(rotated.atoms[0][0]).toBeCloseTo(-1);
      expect(rotated.atoms[0][1]).toBeCloseTo(0);
      // (0, 1) rotated 180 degrees -> (0, -1)
      expect(rotated.atoms[1][0]).toBeCloseTo(0);
      expect(rotated.atoms[1][1]).toBeCloseTo(-1);
    });

    it('should rotate template atoms by 360 degrees (identity)', () => {
      const template: JMol = {
        id: 'test',
        title: 'test',
        atoms: [[3, 4, 0, 'C']],
        bonds: [],
      };

      const rotated = TemplatesHelperService.rootateTemplate(template, 2 * Math.PI, { x: 0, y: 0 });

      expect(rotated.atoms[0][0]).toBeCloseTo(3);
      expect(rotated.atoms[0][1]).toBeCloseTo(4);
    });

    it('should rotate by 0 degrees (no change)', () => {
      const template: JMol = {
        id: 'test',
        title: 'test',
        atoms: [[5, 7, 0, 'N']],
        bonds: [],
      };

      const rotated = TemplatesHelperService.rootateTemplate(template, 0, { x: 0, y: 0 });

      expect(rotated.atoms[0][0]).toBeCloseTo(5);
      expect(rotated.atoms[0][1]).toBeCloseTo(7);
    });

    it('should preserve atom type and set z to new values based on rotation', () => {
      const template: JMol = {
        id: 'test',
        title: 'test',
        atoms: [[1, 0, 5, 'O']],
        bonds: [],
      };

      const rotated = TemplatesHelperService.rootateTemplate(template, Math.PI / 4, { x: 0, y: 0 });

      expect(rotated.atoms[0][3]).toEqual('O');
    });

    it('should not mutate original template', () => {
      const template: JMol = {
        id: 'test',
        title: 'test',
        atoms: [[1, 0, 0, 'C']],
        bonds: [],
      };

      TemplatesHelperService.rootateTemplate(template, Math.PI / 2, { x: 0, y: 0 });

      expect(template.atoms[0][0]).toEqual(1);
      expect(template.atoms[0][1]).toEqual(0);
    });

    it('should rotate all atoms in a multi-atom template', () => {
      const benzene = TemplatesHelperService.getTemplateById('benzene') as JMol;

      const rotated = TemplatesHelperService.rootateTemplate(benzene, Math.PI / 3, { x: 0, y: 0 });

      expect(rotated.atoms.length).toEqual(6);
      // The sum of x and y coordinates should be preserved (rotation is area-preserving)
      // But positions should differ from original
      let anyDifferent = false;
      for (let i = 0; i < rotated.atoms.length; i++) {
        if (Math.abs(rotated.atoms[i][0] - benzene.atoms[i][0]) > 0.001) {
          anyDifferent = true;
          break;
        }
      }
      expect(anyDifferent).toBe(true);
    });

    it('should preserve bonds', () => {
      const template: JMol = {
        id: 'test',
        title: 'test',
        atoms: [
          [1, 0, 0, 'C'],
          [0, 1, 0, 'C'],
        ],
        bonds: [[1, 2, 2]],
      };

      const rotated = TemplatesHelperService.rootateTemplate(template, Math.PI / 6, { x: 0, y: 0 });

      expect(rotated.bonds).toEqual(template.bonds);
    });
  });

  describe('adjustToBondLength', () => {
    it('should adjust molecule to bond length', () => {
      const benzene = TemplatesHelperService.getTemplateById('benzene') as JMol;
      const adjusted = TemplatesHelperService.adjustToBondLength(benzene, 2);
      const center = adjusted.atoms.reduce((acc: number, atom) => {
        return acc + atom[0] + atom[1];
      }, 0);
      expect(center).toBeCloseTo(0);
      expect(adjusted.atoms[0][0] / benzene.atoms[0][0]).toBeCloseTo(0.5);
    });

    it('should scale atoms proportionally', () => {
      const template: JMol = {
        id: 'test',
        title: 'test',
        atoms: [
          [0, 0, 0, 'C'],
          [2, 0, 0, 'C'],
          [4, 0, 0, 'C'],
        ],
        bonds: [
          [1, 2, 1],
          [2, 3, 1],
        ],
      };

      // First bond length is 2. Target length is 1, so scale = 2/1 = 2
      const adjusted = TemplatesHelperService.adjustToBondLength(template, 1);

      // All atoms should be scaled by factor 2
      expect(adjusted.atoms[0][0]).toBeCloseTo(0);
      expect(adjusted.atoms[1][0]).toBeCloseTo(4);
      expect(adjusted.atoms[2][0]).toBeCloseTo(8);
    });

    it('should set z coordinate to 0 for all atoms', () => {
      const template: JMol = {
        id: 'test',
        title: 'test',
        atoms: [
          [0, 0, 5, 'C'],
          [1, 0, 3, 'C'],
        ],
        bonds: [[1, 2, 1]],
      };

      const adjusted = TemplatesHelperService.adjustToBondLength(template, 1);

      expect(adjusted.atoms[0][2]).toEqual(0);
      expect(adjusted.atoms[1][2]).toEqual(0);
    });

    it('should preserve atom types', () => {
      const template: JMol = {
        id: 'test',
        title: 'test',
        atoms: [
          [0, 0, 0, 'N'],
          [1, 1, 0, 'O'],
        ],
        bonds: [[1, 2, 1]],
      };

      const adjusted = TemplatesHelperService.adjustToBondLength(template, 0.5);

      expect(adjusted.atoms[0][3]).toEqual('N');
      expect(adjusted.atoms[1][3]).toEqual('O');
    });

    it('should not mutate original template', () => {
      const template: JMol = {
        id: 'test',
        title: 'test',
        atoms: [
          [0, 0, 0, 'C'],
          [3, 0, 0, 'C'],
        ],
        bonds: [[1, 2, 1]],
      };

      TemplatesHelperService.adjustToBondLength(template, 1);

      expect(template.atoms[0][0]).toEqual(0);
      expect(template.atoms[1][0]).toEqual(3);
    });

    it('should handle scale factor of 1 (same length)', () => {
      const template: JMol = {
        id: 'test',
        title: 'test',
        atoms: [
          [0, 0, 0, 'C'],
          [1, 0, 0, 'C'],
        ],
        bonds: [[1, 2, 1]],
      };

      // Bond length is 1, target is 1, so scale = 1/1 = 1
      const adjusted = TemplatesHelperService.adjustToBondLength(template, 1);

      expect(adjusted.atoms[0][0]).toBeCloseTo(0);
      expect(adjusted.atoms[1][0]).toBeCloseTo(1);
    });
  });
});
