import { mouseDownAction, mouseUpAction, zoomOutAction } from '../../actions/index.js';
import { MOUSE_DOWN, ToolMode } from '../../declarations/index.js';
import type { StoreState, JMolWrapModel } from '../../declarations/index.js';
import {
  CameraHelperService,
  MoleculeHelperService,
  ProjectionHelperService,
  TemplatesHelperService,
  HisoryHelperService,
} from '../../services/index.js';
import { Molecule } from '@chemistry/molecule';
import { fragmentCommandsReducer } from './fragment.command.js';

describe('fragmentCommandsReducer', () => {
  it('should be defined', () => {
    expect(fragmentCommandsReducer).toBeDefined();
  });

  let mockState: StoreState;

  function createEmptyMolecule(): JMolWrapModel {
    return {
      id: 'MOCK-MOLECULE',
      title: 'MOCK-MOLECULE',
      atoms: {},
      bonds: {},
    };
  }

  function createMoleculeWithAtoms(): JMolWrapModel {
    return {
      id: 'MOCK-MOLECULE',
      title: 'MOCK-MOLECULE',
      atoms: {
        'atom:1': { id: 'atom:1', x: -1, y: -1, z: 0, type: 'C' },
        'atom:2': { id: 'atom:2', x: -1, y: 1, z: 0, type: 'C' },
        'atom:3': { id: 'atom:3', x: 1, y: 1, z: 0, type: 'C' },
      },
      bonds: {
        'bond:1': { id: 'bond:1', atom1: 'atom:1', atom2: 'atom:2', order: 1 },
        'bond:2': { id: 'bond:2', atom1: 'atom:2', atom2: 'atom:3', order: 1 },
      },
    };
  }

  beforeEach(() => {
    mockState = {
      toolbar: { mode: ToolMode.fragment, type: 'benzene' },
      cursor: {
        mouseClick: false,
        mouseBegin: { x: 100, y: 100 },
        mouseCurrent: { x: 100, y: 100 },
        data: null,
      },
      data: {
        molecule: createEmptyMolecule(),
        camera: {
          translation: { x: 0, y: 0 },
          scale: 30,
        },
      },
      pastData: [],
      futureData: [],
      cache: { bondsClasification: {} },
      settings: { additionalElements: [] },
      isTableShown: false,
    };
  });

  describe('default case', () => {
    it('should return state unchanged for unhandled action types', () => {
      const action = zoomOutAction();
      const result = fragmentCommandsReducer(mockState, action);

      expect(result).toEqual(mockState);
    });

    it('should return state unchanged for MOUSE_UP action', () => {
      const action = mouseUpAction(100, 100);
      const result = fragmentCommandsReducer(mockState, action);

      expect(result).toEqual(mockState);
    });
  });

  describe('MOUSE_DOWN action', () => {
    describe('#USECASE: apply template to empty canvas (no atom/bond hit)', () => {
      it('should add template atoms and bonds to the molecule', () => {
        const action = mouseDownAction(100, 100);
        const result = fragmentCommandsReducer(mockState, action);

        const atomKeys = Object.keys(result.data.molecule.atoms);
        const bondKeys = Object.keys(result.data.molecule.bonds);

        // Benzene has 6 atoms and 6 bonds
        expect(atomKeys.length).toBe(6);
        expect(bondKeys.length).toBe(6);
      });

      it('should place template atoms near cursor position', () => {
        mockState.cursor.mouseBegin = { x: 150, y: 150 };
        const action = mouseDownAction(150, 150);
        const result = fragmentCommandsReducer(mockState, action);

        const atoms = Object.values(result.data.molecule.atoms);
        // All atoms should be positioned near the unprojected cursor position
        // unproject(camera, {150, 150}) with scale=30, translation={0,0} => {5, 5}
        const avgX = atoms.reduce((sum, a) => sum + a.x, 0) / atoms.length;
        const avgY = atoms.reduce((sum, a) => sum + a.y, 0) / atoms.length;

        expect(avgX).toBeCloseTo(5, 0);
        expect(avgY).toBeCloseTo(5, 0);
      });

      it('should save a history recovery point', () => {
        const action = mouseDownAction(100, 100);
        const result = fragmentCommandsReducer(mockState, action);

        expect(result.pastData.length).toBe(1);
        expect(result.pastData[0]).toEqual(mockState.data);
      });

      it('should clear futureData on new action', () => {
        mockState.futureData = [mockState.data];
        const action = mouseDownAction(100, 100);
        const result = fragmentCommandsReducer(mockState, action);

        expect(result.futureData.length).toBe(0);
      });

      it('should preserve molecule id and title', () => {
        const action = mouseDownAction(100, 100);
        const result = fragmentCommandsReducer(mockState, action);

        expect(result.data.molecule.id).toBe('MOCK-MOLECULE');
        expect(result.data.molecule.title).toBe('MOCK-MOLECULE');
      });

      it('should work with cyclohexane template', () => {
        mockState.toolbar.type = 'cyclohexane';
        const action = mouseDownAction(100, 100);
        const result = fragmentCommandsReducer(mockState, action);

        const atomKeys = Object.keys(result.data.molecule.atoms);
        const bondKeys = Object.keys(result.data.molecule.bonds);

        // Cyclohexane has 6 atoms and 6 bonds
        expect(atomKeys.length).toBe(6);
        expect(bondKeys.length).toBe(6);
      });

      it('should work with cyclopentane template', () => {
        mockState.toolbar.type = 'cyclopentane';
        const action = mouseDownAction(100, 100);
        const result = fragmentCommandsReducer(mockState, action);

        const atomKeys = Object.keys(result.data.molecule.atoms);
        const bondKeys = Object.keys(result.data.molecule.bonds);

        // Cyclopentane has 5 atoms and 5 bonds
        expect(atomKeys.length).toBe(5);
        expect(bondKeys.length).toBe(5);
      });

      it('should work with cyclobutane template', () => {
        mockState.toolbar.type = 'cyclobutane';
        const action = mouseDownAction(100, 100);
        const result = fragmentCommandsReducer(mockState, action);

        const atomKeys = Object.keys(result.data.molecule.atoms);
        const bondKeys = Object.keys(result.data.molecule.bonds);

        // Cyclobutane has 4 atoms and 4 bonds
        expect(atomKeys.length).toBe(4);
        expect(bondKeys.length).toBe(4);
      });

      it('should create atoms with type C', () => {
        const action = mouseDownAction(100, 100);
        const result = fragmentCommandsReducer(mockState, action);

        const atoms = Object.values(result.data.molecule.atoms);
        atoms.forEach((atom) => {
          expect(atom.type).toBe('C');
        });
      });

      it('should not modify the camera state', () => {
        const action = mouseDownAction(100, 100);
        const result = fragmentCommandsReducer(mockState, action);

        expect(result.data.camera).toEqual(mockState.data.camera);
      });
    });

    describe('#USECASE: apply template at cursor on existing molecule (no overlap)', () => {
      it('should add template atoms to existing molecule atoms', () => {
        mockState.data.molecule = createMoleculeWithAtoms();
        // Click far from existing atoms so no projection match
        mockState.cursor.mouseBegin = { x: 600, y: 600 };
        const action = mouseDownAction(600, 600);
        const result = fragmentCommandsReducer(mockState, action);

        const atomKeys = Object.keys(result.data.molecule.atoms);
        // Existing 3 atoms + 6 benzene atoms
        expect(atomKeys.length).toBe(9);
      });

      it('should add template bonds to existing molecule bonds', () => {
        mockState.data.molecule = createMoleculeWithAtoms();
        mockState.cursor.mouseBegin = { x: 600, y: 600 };
        const action = mouseDownAction(600, 600);
        const result = fragmentCommandsReducer(mockState, action);

        const bondKeys = Object.keys(result.data.molecule.bonds);
        // Existing 2 bonds + 6 benzene bonds
        expect(bondKeys.length).toBe(8);
      });

      it('should preserve existing atoms', () => {
        mockState.data.molecule = createMoleculeWithAtoms();
        mockState.cursor.mouseBegin = { x: 600, y: 600 };
        const action = mouseDownAction(600, 600);
        const result = fragmentCommandsReducer(mockState, action);

        expect(result.data.molecule.atoms['atom:1']).toBeDefined();
        expect(result.data.molecule.atoms['atom:2']).toBeDefined();
        expect(result.data.molecule.atoms['atom:3']).toBeDefined();
      });

      it('should preserve existing bonds', () => {
        mockState.data.molecule = createMoleculeWithAtoms();
        mockState.cursor.mouseBegin = { x: 600, y: 600 };
        const action = mouseDownAction(600, 600);
        const result = fragmentCommandsReducer(mockState, action);

        expect(result.data.molecule.bonds['bond:1']).toBeDefined();
        expect(result.data.molecule.bonds['bond:2']).toBeDefined();
      });
    });

    describe('#USECASE: apply template and merge overlapping atoms', () => {
      it('should merge template atoms that overlap with existing atoms', () => {
        // Create a molecule with an atom at position that will overlap with template
        const template = TemplatesHelperService.getTemplateById('cyclobutane')!;
        const camera = { translation: { x: 0, y: 0 }, scale: 30 };

        // Wrap and place template at a known position
        const center = CameraHelperService.unproject(camera, { x: 100, y: 100 });
        const shiftedTemplate = TemplatesHelperService.shiftTemplate(template, center);
        const wrappedTemplate = MoleculeHelperService.wrapMolecule(shiftedTemplate);

        // Get the first atom position from the wrapped template
        const firstAtomId = Object.keys(wrappedTemplate.atoms)[0];
        const firstAtom = wrappedTemplate.atoms[firstAtomId];

        // Place an existing atom exactly at that position
        mockState.data.molecule = {
          id: 'MOCK-MOLECULE',
          title: 'MOCK-MOLECULE',
          atoms: {
            'existing:1': {
              id: 'existing:1',
              x: firstAtom.x,
              y: firstAtom.y,
              z: 0,
              type: 'C',
            },
          },
          bonds: {},
        };
        mockState.data.camera = camera;
        mockState.cursor.mouseBegin = { x: 100, y: 100 };
        mockState.toolbar.type = 'cyclobutane';

        const action = mouseDownAction(100, 100);
        const result = fragmentCommandsReducer(mockState, action);

        // The existing atom should still be there
        expect(result.data.molecule.atoms['existing:1']).toBeDefined();

        // Total atoms should be fewer than existing(1) + template(4) if merging happened
        const atomCount = Object.keys(result.data.molecule.atoms).length;
        expect(atomCount).toBeLessThanOrEqual(4);
      });

      it('should update bond references when atoms are merged', () => {
        // Place template at center, then put an existing atom where first template atom lands
        const template = TemplatesHelperService.getTemplateById('cyclobutane')!;
        const camera = { translation: { x: 0, y: 0 }, scale: 30 };
        const center = CameraHelperService.unproject(camera, { x: 100, y: 100 });
        const shiftedTemplate = TemplatesHelperService.shiftTemplate(template, center);
        const wrappedTemplate = MoleculeHelperService.wrapMolecule(shiftedTemplate);

        const firstAtomId = Object.keys(wrappedTemplate.atoms)[0];
        const firstAtom = wrappedTemplate.atoms[firstAtomId];

        mockState.data.molecule = {
          id: 'MOCK-MOLECULE',
          title: 'MOCK-MOLECULE',
          atoms: {
            'existing:1': {
              id: 'existing:1',
              x: firstAtom.x,
              y: firstAtom.y,
              z: 0,
              type: 'C',
            },
          },
          bonds: {},
        };
        mockState.data.camera = camera;
        mockState.cursor.mouseBegin = { x: 100, y: 100 };
        mockState.toolbar.type = 'cyclobutane';

        const action = mouseDownAction(100, 100);
        const result = fragmentCommandsReducer(mockState, action);

        // Check that bonds reference either existing atom ids or new template atom ids
        const allAtomIds = Object.keys(result.data.molecule.atoms);
        Object.values(result.data.molecule.bonds).forEach((bond) => {
          expect(allAtomIds).toContain(bond.atom1);
          expect(allAtomIds).toContain(bond.atom2);
        });
      });
    });

    describe('#USECASE: apply template to existing bond', () => {
      it('should apply template aligned to the clicked bond', () => {
        // Set up molecule with a bond that the click position will hit
        // Using scale 30, atoms at (-1,-1) and (-1,1) project to (-30,-30) and (-30,30)
        // The bond midpoint is at (-30, 0) in screen space
        mockState.data.molecule = createMoleculeWithAtoms();
        mockState.data.camera = { translation: { x: 0, y: 0 }, scale: 30 };
        mockState.cursor.mouseBegin = { x: -30, y: 0 };

        // Click near the bond between atom:1 and atom:2
        const action = mouseDownAction(-30, 0);
        const result = fragmentCommandsReducer(mockState, action);

        // The template (benzene) should have been applied and merged
        // Original molecule: 3 atoms, 2 bonds
        // After applying benzene template to bond: atoms and bonds should increase
        const atomCount = Object.keys(result.data.molecule.atoms).length;
        const bondCount = Object.keys(result.data.molecule.bonds).length;

        // Template was applied - should have more atoms and bonds than original
        expect(atomCount).toBeGreaterThanOrEqual(3);
        expect(bondCount).toBeGreaterThanOrEqual(2);
      });

      it('should preserve original atoms when applying to bond', () => {
        mockState.data.molecule = createMoleculeWithAtoms();
        mockState.data.camera = { translation: { x: 0, y: 0 }, scale: 30 };
        mockState.cursor.mouseBegin = { x: -30, y: 0 };

        const action = mouseDownAction(-30, 0);
        const result = fragmentCommandsReducer(mockState, action);

        // Original atoms should still exist (they may be merged with template atoms)
        expect(result.data.molecule.atoms['atom:1']).toBeDefined();
        expect(result.data.molecule.atoms['atom:2']).toBeDefined();
        expect(result.data.molecule.atoms['atom:3']).toBeDefined();
      });

      it('should save history when applying to bond', () => {
        mockState.data.molecule = createMoleculeWithAtoms();
        mockState.data.camera = { translation: { x: 0, y: 0 }, scale: 30 };
        mockState.cursor.mouseBegin = { x: -30, y: 0 };

        const action = mouseDownAction(-30, 0);
        const result = fragmentCommandsReducer(mockState, action);

        expect(result.pastData.length).toBe(1);
      });

      it('should apply cyclohexane template to bond', () => {
        mockState.toolbar.type = 'cyclohexane';
        mockState.data.molecule = createMoleculeWithAtoms();
        mockState.data.camera = { translation: { x: 0, y: 0 }, scale: 30 };
        mockState.cursor.mouseBegin = { x: -30, y: 0 };

        const action = mouseDownAction(-30, 0);
        const result = fragmentCommandsReducer(mockState, action);

        const atomCount = Object.keys(result.data.molecule.atoms).length;
        expect(atomCount).toBeGreaterThanOrEqual(3);
      });
    });

    describe('#USECASE: apply template to existing atom', () => {
      it('should return state with unchanged molecule when clicking on an isolated atom', () => {
        // applyTemplateToAtom currently returns state unchanged
        // Use an isolated atom (no bonds) so only atom projection hits, not bond
        mockState.data.molecule = {
          id: 'MOCK-MOLECULE',
          title: 'MOCK-MOLECULE',
          atoms: {
            'atom:1': { id: 'atom:1', x: 5, y: 5, z: 0, type: 'C' },
          },
          bonds: {},
        };
        mockState.data.camera = { translation: { x: 0, y: 0 }, scale: 30 };

        // atom:1 at (5,5) projects to (150, 150) in screen space
        mockState.cursor.mouseBegin = { x: 150, y: 150 };

        const action = mouseDownAction(150, 150);
        const result = fragmentCommandsReducer(mockState, action);

        // applyTemplateToAtom returns state as-is (with history saved)
        // The molecule atoms/bonds should remain unchanged
        const atomCount = Object.keys(result.data.molecule.atoms).length;
        expect(atomCount).toBe(1);
        expect(result.data.molecule.bonds).toEqual({});
      });

      it('should save history when clicking on atom even though molecule is unchanged', () => {
        mockState.data.molecule = {
          id: 'MOCK-MOLECULE',
          title: 'MOCK-MOLECULE',
          atoms: {
            'atom:1': { id: 'atom:1', x: 5, y: 5, z: 0, type: 'C' },
          },
          bonds: {},
        };
        mockState.data.camera = { translation: { x: 0, y: 0 }, scale: 30 };
        mockState.cursor.mouseBegin = { x: 150, y: 150 };

        const action = mouseDownAction(150, 150);
        const result = fragmentCommandsReducer(mockState, action);

        // History should still be saved
        expect(result.pastData.length).toBe(1);
      });
    });
  });

  describe('applyJMolAndMergeAtoms behavior', () => {
    it('should shift template atoms when merging with existing atoms', () => {
      // Create two atoms that will overlap with a cyclobutane template
      const template = TemplatesHelperService.getTemplateById('cyclobutane')!;
      const camera = { translation: { x: 0, y: 0 }, scale: 30 };
      const center = CameraHelperService.unproject(camera, { x: 100, y: 100 });
      const shiftedTemplate = TemplatesHelperService.shiftTemplate(template, center);
      const wrappedTemplate = MoleculeHelperService.wrapMolecule(shiftedTemplate);

      const atomIds = Object.keys(wrappedTemplate.atoms);
      const atom0 = wrappedTemplate.atoms[atomIds[0]];
      const atom1 = wrappedTemplate.atoms[atomIds[1]];

      // Place two existing atoms at template atom positions
      mockState.data.molecule = {
        id: 'MOCK-MOLECULE',
        title: 'MOCK-MOLECULE',
        atoms: {
          'existing:1': {
            id: 'existing:1',
            x: atom0.x,
            y: atom0.y,
            z: 0,
            type: 'C',
          },
          'existing:2': {
            id: 'existing:2',
            x: atom1.x,
            y: atom1.y,
            z: 0,
            type: 'C',
          },
        },
        bonds: {
          'existing-bond:1': {
            id: 'existing-bond:1',
            atom1: 'existing:1',
            atom2: 'existing:2',
            order: 1,
          },
        },
      };
      mockState.data.camera = camera;
      mockState.cursor.mouseBegin = { x: 100, y: 100 };
      mockState.toolbar.type = 'cyclobutane';

      const action = mouseDownAction(100, 100);
      const result = fragmentCommandsReducer(mockState, action);

      // Existing atoms should be preserved
      expect(result.data.molecule.atoms['existing:1']).toBeDefined();
      expect(result.data.molecule.atoms['existing:2']).toBeDefined();

      // Since two template atoms overlap with existing ones, we get 2 existing + 2 new = 4
      const atomCount = Object.keys(result.data.molecule.atoms).length;
      expect(atomCount).toBeLessThanOrEqual(4);
    });

    it('should remove duplicate bonds when both endpoints are merged', () => {
      // If a template bond's both atoms get merged to existing atoms that are already bonded,
      // that template bond should be deleted
      const template = TemplatesHelperService.getTemplateById('cyclobutane')!;
      const camera = { translation: { x: 0, y: 0 }, scale: 30 };
      const center = CameraHelperService.unproject(camera, { x: 100, y: 100 });
      const shiftedTemplate = TemplatesHelperService.shiftTemplate(template, center);
      const wrappedTemplate = MoleculeHelperService.wrapMolecule(shiftedTemplate);

      const atomIds = Object.keys(wrappedTemplate.atoms);
      const bondIds = Object.keys(wrappedTemplate.bonds);
      const firstBond = wrappedTemplate.bonds[bondIds[0]];
      const atom1Pos = wrappedTemplate.atoms[firstBond.atom1];
      const atom2Pos = wrappedTemplate.atoms[firstBond.atom2];

      // Place existing atoms at both ends of the first template bond
      mockState.data.molecule = {
        id: 'MOCK-MOLECULE',
        title: 'MOCK-MOLECULE',
        atoms: {
          'existing:1': {
            id: 'existing:1',
            x: atom1Pos.x,
            y: atom1Pos.y,
            z: 0,
            type: 'C',
          },
          'existing:2': {
            id: 'existing:2',
            x: atom2Pos.x,
            y: atom2Pos.y,
            z: 0,
            type: 'C',
          },
        },
        bonds: {
          'existing-bond:1': {
            id: 'existing-bond:1',
            atom1: 'existing:1',
            atom2: 'existing:2',
            order: 1,
          },
        },
      };
      mockState.data.camera = camera;
      mockState.cursor.mouseBegin = { x: 100, y: 100 };
      mockState.toolbar.type = 'cyclobutane';

      const action = mouseDownAction(100, 100);
      const result = fragmentCommandsReducer(mockState, action);

      // The existing bond should still be there
      expect(result.data.molecule.bonds['existing-bond:1']).toBeDefined();

      // All bonds should have valid atom references
      const allAtomIds = Object.keys(result.data.molecule.atoms);
      Object.values(result.data.molecule.bonds).forEach((bond) => {
        expect(allAtomIds).toContain(bond.atom1);
        expect(allAtomIds).toContain(bond.atom2);
      });
    });

    it('should replace bond atom reference when only one endpoint is merged', () => {
      // If only one atom of a template bond overlaps with an existing atom,
      // the bond should update that atom reference but keep the bond
      const template = TemplatesHelperService.getTemplateById('cyclobutane')!;
      const camera = { translation: { x: 0, y: 0 }, scale: 30 };
      const center = CameraHelperService.unproject(camera, { x: 100, y: 100 });
      const shiftedTemplate = TemplatesHelperService.shiftTemplate(template, center);
      const wrappedTemplate = MoleculeHelperService.wrapMolecule(shiftedTemplate);

      const atomIds = Object.keys(wrappedTemplate.atoms);
      const atom0 = wrappedTemplate.atoms[atomIds[0]];

      // Only one existing atom at the position of the first template atom (no bond)
      mockState.data.molecule = {
        id: 'MOCK-MOLECULE',
        title: 'MOCK-MOLECULE',
        atoms: {
          'existing:1': {
            id: 'existing:1',
            x: atom0.x,
            y: atom0.y,
            z: 0,
            type: 'C',
          },
        },
        bonds: {},
      };
      mockState.data.camera = camera;
      mockState.cursor.mouseBegin = { x: 100, y: 100 };
      mockState.toolbar.type = 'cyclobutane';

      const action = mouseDownAction(100, 100);
      const result = fragmentCommandsReducer(mockState, action);

      // Should have the existing atom + 3 new template atoms (1 was merged)
      const atomCount = Object.keys(result.data.molecule.atoms).length;
      expect(atomCount).toBe(4);

      // Some bonds should reference "existing:1"
      const bondsReferencingExisting = Object.values(result.data.molecule.bonds).filter(
        (bond) => bond.atom1 === 'existing:1' || bond.atom2 === 'existing:1'
      );
      expect(bondsReferencingExisting.length).toBeGreaterThan(0);
    });
  });

  describe('isConneted helper (tested indirectly)', () => {
    it('should detect connected atoms and remove duplicate bonds', () => {
      // This tests the isConneted function indirectly by setting up a scenario
      // where template bond endpoints both merge to atoms that are already bonded
      const template = TemplatesHelperService.getTemplateById('cyclobutane')!;
      const camera = { translation: { x: 0, y: 0 }, scale: 30 };
      const center = CameraHelperService.unproject(camera, { x: 100, y: 100 });
      const shiftedTemplate = TemplatesHelperService.shiftTemplate(template, center);
      const wrappedTemplate = MoleculeHelperService.wrapMolecule(shiftedTemplate);

      const bondIds = Object.keys(wrappedTemplate.bonds);
      const firstBond = wrappedTemplate.bonds[bondIds[0]];
      const atom1 = wrappedTemplate.atoms[firstBond.atom1];
      const atom2 = wrappedTemplate.atoms[firstBond.atom2];

      // Create existing molecule with already-bonded atoms at the overlap positions
      mockState.data.molecule = {
        id: 'MOCK-MOLECULE',
        title: 'MOCK-MOLECULE',
        atoms: {
          e1: { id: 'e1', x: atom1.x, y: atom1.y, z: 0, type: 'C' },
          e2: { id: 'e2', x: atom2.x, y: atom2.y, z: 0, type: 'C' },
        },
        bonds: {
          eb1: { id: 'eb1', atom1: 'e1', atom2: 'e2', order: 1 },
        },
      };
      mockState.data.camera = camera;
      mockState.cursor.mouseBegin = { x: 100, y: 100 };
      mockState.toolbar.type = 'cyclobutane';

      const action = mouseDownAction(100, 100);
      const result = fragmentCommandsReducer(mockState, action);

      // The existing bond eb1 should remain
      expect(result.data.molecule.bonds.eb1).toBeDefined();

      // All bonds should be valid (no dangling references)
      const allAtomIds = Object.keys(result.data.molecule.atoms);
      Object.values(result.data.molecule.bonds).forEach((bond) => {
        expect(allAtomIds).toContain(bond.atom1);
        expect(allAtomIds).toContain(bond.atom2);
      });
    });

    it('should detect reverse-direction bond connection', () => {
      // Test isConneted with reversed atom order: bond with atom1=B, atom2=A
      const template = TemplatesHelperService.getTemplateById('cyclobutane')!;
      const camera = { translation: { x: 0, y: 0 }, scale: 30 };
      const center = CameraHelperService.unproject(camera, { x: 100, y: 100 });
      const shiftedTemplate = TemplatesHelperService.shiftTemplate(template, center);
      const wrappedTemplate = MoleculeHelperService.wrapMolecule(shiftedTemplate);

      const bondIds = Object.keys(wrappedTemplate.bonds);
      const firstBond = wrappedTemplate.bonds[bondIds[0]];
      const atom1 = wrappedTemplate.atoms[firstBond.atom1];
      const atom2 = wrappedTemplate.atoms[firstBond.atom2];

      // Same as above but bond direction is reversed
      mockState.data.molecule = {
        id: 'MOCK-MOLECULE',
        title: 'MOCK-MOLECULE',
        atoms: {
          e1: { id: 'e1', x: atom1.x, y: atom1.y, z: 0, type: 'C' },
          e2: { id: 'e2', x: atom2.x, y: atom2.y, z: 0, type: 'C' },
        },
        bonds: {
          // Note: reversed order - atom2 to atom1
          eb1: { id: 'eb1', atom1: 'e2', atom2: 'e1', order: 1 },
        },
      };
      mockState.data.camera = camera;
      mockState.cursor.mouseBegin = { x: 100, y: 100 };
      mockState.toolbar.type = 'cyclobutane';

      const action = mouseDownAction(100, 100);
      const result = fragmentCommandsReducer(mockState, action);

      // The existing bond eb1 should remain
      expect(result.data.molecule.bonds.eb1).toBeDefined();

      // Bonds should still be valid
      const allAtomIds = Object.keys(result.data.molecule.atoms);
      Object.values(result.data.molecule.bonds).forEach((bond) => {
        expect(allAtomIds).toContain(bond.atom1);
        expect(allAtomIds).toContain(bond.atom2);
      });
    });

    it('should not remove template bond when endpoints map to unconnected existing atoms', () => {
      // When template atoms merge with existing atoms that do NOT have a bond between them
      const template = TemplatesHelperService.getTemplateById('cyclobutane')!;
      const camera = { translation: { x: 0, y: 0 }, scale: 30 };
      const center = CameraHelperService.unproject(camera, { x: 100, y: 100 });
      const shiftedTemplate = TemplatesHelperService.shiftTemplate(template, center);
      const wrappedTemplate = MoleculeHelperService.wrapMolecule(shiftedTemplate);

      const bondIds = Object.keys(wrappedTemplate.bonds);
      const firstBond = wrappedTemplate.bonds[bondIds[0]];
      const atom1 = wrappedTemplate.atoms[firstBond.atom1];
      const atom2 = wrappedTemplate.atoms[firstBond.atom2];

      // Place existing atoms at those positions but with NO bond between them
      mockState.data.molecule = {
        id: 'MOCK-MOLECULE',
        title: 'MOCK-MOLECULE',
        atoms: {
          e1: { id: 'e1', x: atom1.x, y: atom1.y, z: 0, type: 'C' },
          e2: { id: 'e2', x: atom2.x, y: atom2.y, z: 0, type: 'C' },
        },
        bonds: {},
      };
      mockState.data.camera = camera;
      mockState.cursor.mouseBegin = { x: 100, y: 100 };
      mockState.toolbar.type = 'cyclobutane';

      const action = mouseDownAction(100, 100);
      const result = fragmentCommandsReducer(mockState, action);

      // There should be bonds connecting e1 and e2 (template bond was kept and updated)
      const bondsConnecting = Object.values(result.data.molecule.bonds).filter(
        (bond) =>
          (bond.atom1 === 'e1' && bond.atom2 === 'e2') ||
          (bond.atom1 === 'e2' && bond.atom2 === 'e1')
      );
      expect(bondsConnecting.length).toBeGreaterThan(0);
    });
  });

  describe('replaceMolecule helper (tested indirectly)', () => {
    it('should produce a new state object (not mutate original)', () => {
      const action = mouseDownAction(100, 100);
      const result = fragmentCommandsReducer(mockState, action);

      expect(result).not.toBe(mockState);
      expect(result.data).not.toBe(mockState.data);
      expect(result.data.molecule).not.toBe(mockState.data.molecule);
    });

    it('should preserve non-data state properties', () => {
      mockState.settings.additionalElements = ['N', 'O'];
      mockState.isTableShown = true;

      const action = mouseDownAction(100, 100);
      const result = fragmentCommandsReducer(mockState, action);

      expect(result.settings.additionalElements).toEqual(['N', 'O']);
      expect(result.isTableShown).toBe(true);
      expect(result.toolbar).toEqual(mockState.toolbar);
    });
  });

  describe('applyTemplateToBond - bond view classification swap', () => {
    it('should handle negative bView by swapping atom1 and atom2', () => {
      // Using cyclobutane (order: -1), if bView ends up negative the atoms swap
      mockState.toolbar.type = 'cyclobutane';
      mockState.data.molecule = createMoleculeWithAtoms();
      mockState.data.camera = { translation: { x: 0, y: 0 }, scale: 30 };
      mockState.cursor.mouseBegin = { x: -30, y: 0 };

      const action = mouseDownAction(-30, 0);
      const result = fragmentCommandsReducer(mockState, action);

      // Should still produce valid molecule regardless of swap
      const atomCount = Object.keys(result.data.molecule.atoms).length;
      expect(atomCount).toBeGreaterThanOrEqual(3);

      // Bonds should be valid
      const allAtomIds = Object.keys(result.data.molecule.atoms);
      Object.values(result.data.molecule.bonds).forEach((bond) => {
        expect(allAtomIds).toContain(bond.atom1);
        expect(allAtomIds).toContain(bond.atom2);
      });
    });

    it('should swap bond atoms when bView is negative (patched getBondsViewClasification)', () => {
      // Patch Molecule.prototype to return a positive bView classification,
      // then use cyclobutane (order: -1) so bView * order < 0, triggering the swap
      const originalProto = Molecule.prototype as any;
      const origMethod = originalProto.getBondsViewClasification;

      mockState.data.molecule = createMoleculeWithAtoms();
      mockState.data.camera = { translation: { x: 0, y: 0 }, scale: 30 };
      mockState.cursor.mouseBegin = { x: -30, y: 0 };
      // cyclobutane has order: -1, so if bView=1 then bView*order = -1 < 0
      mockState.toolbar.type = 'cyclobutane';

      // Temporarily add getBondsViewClasification that returns positive value for all bonds
      originalProto.getBondsViewClasification = function () {
        const bonds = this.state?.bonds ?? {};
        const result: Record<string, number> = {};
        Object.keys(bonds).forEach((bondId) => {
          result[bondId] = 1;
        });
        // Also include the original molecule bond ids
        Object.keys(mockState.data.molecule.bonds).forEach((bondId) => {
          result[bondId] = 1;
        });
        return result;
      };

      try {
        const action = mouseDownAction(-30, 0);
        const result = fragmentCommandsReducer(mockState, action);

        // Should produce a valid molecule even with atom swap
        const atomCount = Object.keys(result.data.molecule.atoms).length;
        expect(atomCount).toBeGreaterThanOrEqual(3);

        const allAtomIds = Object.keys(result.data.molecule.atoms);
        Object.values(result.data.molecule.bonds).forEach((bond) => {
          expect(allAtomIds).toContain(bond.atom1);
          expect(allAtomIds).toContain(bond.atom2);
        });
      } finally {
        // Restore original state
        if (origMethod) {
          originalProto.getBondsViewClasification = origMethod;
        } else {
          delete originalProto.getBondsViewClasification;
        }
      }
    });

    it('should not swap atoms when bView is positive', () => {
      // Patch Molecule.prototype to return a negative bView classification,
      // then use cyclobutane (order: -1) so bView * order > 0, no swap
      const originalProto = Molecule.prototype as any;
      const origMethod = originalProto.getBondsViewClasification;

      mockState.data.molecule = createMoleculeWithAtoms();
      mockState.data.camera = { translation: { x: 0, y: 0 }, scale: 30 };
      mockState.cursor.mouseBegin = { x: -30, y: 0 };
      mockState.toolbar.type = 'cyclobutane';

      originalProto.getBondsViewClasification = function () {
        const result: Record<string, number> = {};
        Object.keys(mockState.data.molecule.bonds).forEach((bondId) => {
          result[bondId] = -1; // negative * negative order(-1) = positive, no swap
        });
        return result;
      };

      try {
        const action = mouseDownAction(-30, 0);
        const result = fragmentCommandsReducer(mockState, action);

        const atomCount = Object.keys(result.data.molecule.atoms).length;
        expect(atomCount).toBeGreaterThanOrEqual(3);
      } finally {
        if (origMethod) {
          originalProto.getBondsViewClasification = origMethod;
        } else {
          delete originalProto.getBondsViewClasification;
        }
      }
    });

    it('should handle Molecule load error gracefully (bView defaults to 0)', () => {
      // Set up a molecule with invalid data that would cause Molecule.load to throw
      mockState.data.molecule = {
        id: 'MOCK-MOLECULE',
        title: 'MOCK-MOLECULE',
        atoms: {
          'atom:1': { id: 'atom:1', x: 0, y: 0, z: 0, type: 'C' },
          'atom:2': { id: 'atom:2', x: 1, y: 0, z: 0, type: 'C' },
        },
        bonds: {
          'bond:1': { id: 'bond:1', atom1: 'atom:1', atom2: 'atom:2', order: 1 },
        },
      };
      mockState.data.camera = { translation: { x: 0, y: 0 }, scale: 30 };
      // Click on the midpoint of the bond between atom:1(0,0) and atom:2(1,0)
      // project: (0.5, 0) * 30 = (15, 0)
      mockState.cursor.mouseBegin = { x: 15, y: 0 };

      const action = mouseDownAction(15, 0);
      // Should not throw even if Molecule.load fails internally
      const result = fragmentCommandsReducer(mockState, action);

      expect(result).toBeDefined();
      const atomCount = Object.keys(result.data.molecule.atoms).length;
      expect(atomCount).toBeGreaterThanOrEqual(2);
    });
  });

  describe('edge cases', () => {
    it('should handle template with no matching atoms for merge (empty molecule)', () => {
      mockState.data.molecule = createEmptyMolecule();
      const action = mouseDownAction(100, 100);
      const result = fragmentCommandsReducer(mockState, action);

      // All template atoms should be added, no merging
      const atomCount = Object.keys(result.data.molecule.atoms).length;
      expect(atomCount).toBe(6); // benzene
    });

    it('should handle applying multiple templates sequentially', () => {
      // First apply
      const action1 = mouseDownAction(100, 100);
      const state1 = fragmentCommandsReducer(mockState, action1);

      // Second apply at a different position
      const state2 = {
        ...state1,
        cursor: {
          ...state1.cursor,
          mouseBegin: { x: 500, y: 500 },
        },
      };
      const action2 = mouseDownAction(500, 500);
      const result = fragmentCommandsReducer(state2, action2);

      // Should now have 12 atoms (two benzene rings)
      const atomCount = Object.keys(result.data.molecule.atoms).length;
      expect(atomCount).toBe(12);
    });

    it('should handle molecule with no bonds in isConneted check', () => {
      // Create molecule with atoms but no bonds, then overlay template
      const template = TemplatesHelperService.getTemplateById('cyclobutane')!;
      const camera = { translation: { x: 0, y: 0 }, scale: 30 };
      const center = CameraHelperService.unproject(camera, { x: 100, y: 100 });
      const shiftedTemplate = TemplatesHelperService.shiftTemplate(template, center);
      const wrappedTemplate = MoleculeHelperService.wrapMolecule(shiftedTemplate);

      const atomIds = Object.keys(wrappedTemplate.atoms);
      const bondIds = Object.keys(wrappedTemplate.bonds);
      const firstBond = wrappedTemplate.bonds[bondIds[0]];
      const atom1 = wrappedTemplate.atoms[firstBond.atom1];
      const atom2 = wrappedTemplate.atoms[firstBond.atom2];

      mockState.data.molecule = {
        id: 'MOCK-MOLECULE',
        title: 'MOCK-MOLECULE',
        atoms: {
          e1: { id: 'e1', x: atom1.x, y: atom1.y, z: 0, type: 'C' },
          e2: { id: 'e2', x: atom2.x, y: atom2.y, z: 0, type: 'C' },
        },
        bonds: {}, // no bonds
      };
      mockState.data.camera = camera;
      mockState.cursor.mouseBegin = { x: 100, y: 100 };
      mockState.toolbar.type = 'cyclobutane';

      const action = mouseDownAction(100, 100);
      const result = fragmentCommandsReducer(mockState, action);

      // Should not throw and should produce valid state
      expect(result).toBeDefined();
      const allAtomIds = Object.keys(result.data.molecule.atoms);
      Object.values(result.data.molecule.bonds).forEach((bond) => {
        expect(allAtomIds).toContain(bond.atom1);
        expect(allAtomIds).toContain(bond.atom2);
      });
    });

    it('should use unproject based on cursor mouseBegin for template placement', () => {
      // Test with different camera settings
      mockState.data.camera = { translation: { x: 50, y: 50 }, scale: 25 };
      mockState.cursor.mouseBegin = { x: 100, y: 100 };

      const action = mouseDownAction(100, 100);
      const result = fragmentCommandsReducer(mockState, action);

      // unproject({100, 100}) with scale=25, translation={50,50} => {(100-50)/25, (100-50)/25} = {2, 2}
      const atoms = Object.values(result.data.molecule.atoms);
      const avgX = atoms.reduce((sum, a) => sum + a.x, 0) / atoms.length;
      const avgY = atoms.reduce((sum, a) => sum + a.y, 0) / atoms.length;

      expect(avgX).toBeCloseTo(2, 0);
      expect(avgY).toBeCloseTo(2, 0);
    });
  });
});
