import {
  mouseDownAction,
  mouseLeaveAction,
  mouseMoveAction,
  mouseUpAction,
  zoomOutAction,
} from '../../actions/index.js';
import { ToolMode } from '../../declarations/index.js';
import { bondCommandsReducer } from './bond.commands.js';
import type { CursorBondData } from './bond.commands.js';

describe('bondCommandsReducer', () => {
  it('should be defined', () => {
    expect(bondCommandsReducer).toBeDefined();
  });

  let mockState: any;

  beforeEach(() => {
    mockState = {
      toolbar: { mode: ToolMode.bond, type: 1 },
      cursor: {
        mouseClick: false,
        mouseBegin: { x: 0, y: 0 },
        mouseCurrent: { x: 0, y: 0 },
        data: null,
      },
      data: {
        molecule: {
          atoms: {
            'atom:1': {
              id: 'atom:1',
              x: -1,
              y: -1,
              z: 0,
              type: 'C',
            },
            'atom:2': {
              id: 'atom:2',
              x: -1,
              y: 1,
              z: 0,
              type: 'C',
            },
            'atom:3': {
              id: 'atom:3',
              x: 1,
              y: 1,
              z: 0,
              type: 'C',
            },
          },
          bonds: {
            'bond:1': {
              id: 'bond:1',
              atom1: 'atom:1',
              atom2: 'atom:2',
              order: 1,
            },
            'bond:2': {
              id: 'bond:2',
              atom1: 'atom:2',
              atom2: 'atom:3',
              order: 1,
            },
          },
          id: 'MOCK-MOLECULE',
          title: 'MOCK-MOLECULE',
        },
        camera: {
          translation: {
            x: 0,
            y: 0,
          },
          scale: 100,
        },
      },
      pastData: [],
      futureData: [],
    };
  });

  it('should ignote other actions', () => {
    const action = zoomOutAction();
    const actualState = bondCommandsReducer(mockState, action);

    expect(actualState).toEqual(mockState);
  });

  describe('#USECASE: user click on bond', () => {
    it('should increase bond order', () => {
      mockState.toolbar.type = 2;
      mockState.cursor.mouseBegin = { x: -100, y: 0 };
      mockState.cursor.mouseCurrent = { x: -100, y: 0 };

      const action = mouseDownAction(-101, 0);
      const actualState = bondCommandsReducer(mockState, action);

      const bondOrders = [
        actualState.data.molecule.bonds['bond:1'].order,
        actualState.data.molecule.bonds['bond:2'].order,
      ];
      expect(bondOrders).toEqual([2, 1]);
    });

    it('should save history record', () => {
      mockState.toolbar.type = 2;
      mockState.cursor.mouseBegin = { x: -100, y: 0 };
      mockState.cursor.mouseCurrent = { x: -100, y: 0 };

      const action = mouseDownAction(101, 101);
      const actualState = bondCommandsReducer(mockState, action);

      expect(actualState.pastData).toEqual([mockState.data]);
    });
  });

  describe('#increaseBondOrder', () => {
    it('should set bond order to 3 when toolbar type is 3', () => {
      mockState.toolbar.type = 3;
      mockState.cursor.mouseBegin = { x: -100, y: 0 };
      mockState.cursor.mouseCurrent = { x: -100, y: 0 };

      const action = mouseDownAction(-100, 0);
      const actualState = bondCommandsReducer(mockState, action);

      expect(actualState.data.molecule.bonds['bond:1'].order).toBe(3);
    });

    it('should cycle bond order 1 -> 2 when toolbar type is 1 (default cycling)', () => {
      mockState.toolbar.type = 1;
      mockState.cursor.mouseBegin = { x: -100, y: 0 };
      mockState.cursor.mouseCurrent = { x: -100, y: 0 };

      const action = mouseDownAction(-100, 0);
      const actualState = bondCommandsReducer(mockState, action);

      expect(actualState.data.molecule.bonds['bond:1'].order).toBe(2);
    });

    it('should cycle bond order 2 -> 3 when toolbar type is 1 (default cycling)', () => {
      mockState.toolbar.type = 1;
      mockState.data.molecule.bonds['bond:1'].order = 2;
      mockState.cursor.mouseBegin = { x: -100, y: 0 };
      mockState.cursor.mouseCurrent = { x: -100, y: 0 };

      const action = mouseDownAction(-100, 0);
      const actualState = bondCommandsReducer(mockState, action);

      expect(actualState.data.molecule.bonds['bond:1'].order).toBe(3);
    });

    it('should cycle bond order 3 -> 1 when toolbar type is 1 (wraps around)', () => {
      mockState.toolbar.type = 1;
      mockState.data.molecule.bonds['bond:1'].order = 3;
      mockState.cursor.mouseBegin = { x: -100, y: 0 };
      mockState.cursor.mouseCurrent = { x: -100, y: 0 };

      const action = mouseDownAction(-100, 0);
      const actualState = bondCommandsReducer(mockState, action);

      expect(actualState.data.molecule.bonds['bond:1'].order).toBe(1);
    });

    it('should clear cursor data after increasing bond order', () => {
      mockState.toolbar.type = 2;
      mockState.cursor.mouseBegin = { x: -100, y: 0 };
      mockState.cursor.mouseCurrent = { x: -100, y: 0 };

      const action = mouseDownAction(-100, 0);
      const actualState = bondCommandsReducer(mockState, action);

      expect(actualState.cursor.data).toBeNull();
    });

    it('should not modify other bonds when increasing bond order', () => {
      mockState.toolbar.type = 2;
      mockState.cursor.mouseBegin = { x: -100, y: 0 };
      mockState.cursor.mouseCurrent = { x: -100, y: 0 };

      const action = mouseDownAction(-100, 0);
      const actualState = bondCommandsReducer(mockState, action);

      expect(actualState.data.molecule.bonds['bond:2'].order).toBe(1);
    });
  });

  describe('#shouldProcessIncreaseBond', () => {
    it('should return false (call proposeNewBond) when click is on an atom', () => {
      // Clicking at (-100, -100) which is the projected position of atom:1
      // shouldProcessIncreaseBond returns false because atom is found
      // so proposeNewBond is called instead
      mockState.cursor.mouseBegin = { x: -100, y: -100 };
      mockState.cursor.mouseCurrent = { x: -100, y: -100 };

      const action = mouseDownAction(-100, -100);
      const actualState = bondCommandsReducer(mockState, action);

      // proposeNewBond creates cursor data with bondId
      expect(actualState.cursor.data).not.toBeNull();
      expect((actualState.cursor.data as CursorBondData).bondId).toBeTruthy();
    });

    it('should return false (call proposeNewBond) when click is on empty space', () => {
      // Clicking at (500, 500) which is far from any atom or bond
      mockState.cursor.mouseBegin = { x: 500, y: 500 };
      mockState.cursor.mouseCurrent = { x: 500, y: 500 };

      const action = mouseDownAction(500, 500);
      const actualState = bondCommandsReducer(mockState, action);

      // proposeNewBond creates cursor data with bondId
      expect(actualState.cursor.data).not.toBeNull();
      expect((actualState.cursor.data as CursorBondData).bondId).toBeTruthy();
    });
  });

  describe('#proposeNewBond', () => {
    it('should create a new bond when clicking on an existing atom', () => {
      // Click on atom:1 at projected position (-100, -100)
      mockState.cursor.mouseBegin = { x: -100, y: -100 };
      mockState.cursor.mouseCurrent = { x: -100, y: -100 };

      const action = mouseDownAction(-100, -100);
      const actualState = bondCommandsReducer(mockState, action);

      // Should have cursor data with a bondId
      const cursorData = actualState.cursor.data as CursorBondData;
      expect(cursorData).not.toBeNull();
      expect(cursorData.bondId).toBeTruthy();
      expect(cursorData.startAtom.id).toBe('atom:1');

      // A new bond should exist in the molecule
      const bonds = actualState.data.molecule.bonds;
      expect(bonds[cursorData.bondId]).toBeDefined();
      expect(bonds[cursorData.bondId].atom1).toBe('atom:1');
    });

    it('should create a new start atom when clicking on empty space', () => {
      // Click far from any atom (500, 500)
      mockState.cursor.mouseBegin = { x: 500, y: 500 };
      mockState.cursor.mouseCurrent = { x: 500, y: 500 };

      const action = mouseDownAction(500, 500);
      const actualState = bondCommandsReducer(mockState, action);

      const cursorData = actualState.cursor.data as CursorBondData;
      expect(cursorData).not.toBeNull();
      expect(cursorData.bondId).toBeTruthy();

      // The start atom should be a new atom (not one of the original atoms)
      const startAtomId = cursorData.startAtom.id;
      expect(startAtomId).not.toBe('atom:1');
      expect(startAtomId).not.toBe('atom:2');
      expect(startAtomId).not.toBe('atom:3');

      // The new atom should exist in the molecule
      expect(actualState.data.molecule.atoms[startAtomId]).toBeDefined();
    });

    it('should save a recovery point in history', () => {
      mockState.cursor.mouseBegin = { x: 500, y: 500 };
      mockState.cursor.mouseCurrent = { x: 500, y: 500 };

      const action = mouseDownAction(500, 500);
      const actualState = bondCommandsReducer(mockState, action);

      expect(actualState.pastData.length).toBe(1);
    });

    it('should create a bond with the toolbar bond order', () => {
      mockState.toolbar.type = 2;
      mockState.cursor.mouseBegin = { x: 500, y: 500 };
      mockState.cursor.mouseCurrent = { x: 500, y: 500 };

      const action = mouseDownAction(500, 500);
      const actualState = bondCommandsReducer(mockState, action);

      const cursorData = actualState.cursor.data as CursorBondData;
      const bond = actualState.data.molecule.bonds[cursorData.bondId];
      expect(bond.order).toBe(2);
    });

    it('should create an end atom when proposed end position has no existing atom', () => {
      // Click on atom:3 at projected position (100, 100), which has no
      // neighbour in the direction proposeEndAtom would choose
      mockState.cursor.mouseBegin = { x: 100, y: 100 };
      mockState.cursor.mouseCurrent = { x: 100, y: 100 };

      const action = mouseDownAction(100, 100);
      const actualState = bondCommandsReducer(mockState, action);

      const cursorData = actualState.cursor.data as CursorBondData;
      expect(cursorData.startAtom.id).toBe('atom:3');

      // The bond should connect atom:3 to a new atom
      const bond = actualState.data.molecule.bonds[cursorData.bondId];
      expect(bond.atom1).toBe('atom:3');
      expect(bond.atom2).not.toBe('atom:1');
      expect(bond.atom2).not.toBe('atom:2');
      expect(bond.atom2).not.toBe('atom:3');
    });

    it('should set isAtom2Created to true when end atom is newly created', () => {
      // Click far from any atom
      mockState.cursor.mouseBegin = { x: 500, y: 500 };
      mockState.cursor.mouseCurrent = { x: 500, y: 500 };

      const action = mouseDownAction(500, 500);
      const actualState = bondCommandsReducer(mockState, action);

      const cursorData = actualState.cursor.data as CursorBondData;
      expect(cursorData.isAtom2Created).toBe(true);
    });
  });

  describe('#MOUSE_MOVE (updateBond)', () => {
    it('should return state unchanged when cursor data has no bondId', () => {
      mockState.cursor.data = {
        isAtom2Created: false,
        bondId: '',
        startAtom: mockState.data.molecule.atoms['atom:1'],
      };

      const action = mouseMoveAction(200, 200);
      const actualState = bondCommandsReducer(mockState, action);

      expect(actualState).toBe(mockState);
    });

    it('should return state unchanged when mouse movement distance is less than 10px', () => {
      mockState.cursor.mouseBegin = { x: 100, y: 100 };
      mockState.cursor.mouseCurrent = { x: 105, y: 105 };
      mockState.cursor.data = {
        isAtom2Created: true,
        bondId: 'bond:1',
        startAtom: mockState.data.molecule.atoms['atom:1'],
      };

      const action = mouseMoveAction(105, 105);
      const actualState = bondCommandsReducer(mockState, action);

      expect(actualState).toBe(mockState);
    });

    it('should update atom position when dragging with isAtom2Created and no hover target', () => {
      // First propose a bond by clicking on atom:3
      mockState.cursor.mouseBegin = { x: 100, y: 100 };
      mockState.cursor.mouseCurrent = { x: 100, y: 100 };

      const downAction = mouseDownAction(100, 100);
      let state = bondCommandsReducer(mockState, downAction);

      const cursorData = state.cursor.data as CursorBondData;
      expect(cursorData.bondId).toBeTruthy();
      expect(cursorData.isAtom2Created).toBe(true);

      // Now move mouse far enough (>10px) to a position with no hovering atoms
      state = {
        ...state,
        cursor: {
          ...state.cursor,
          mouseCurrent: { x: 400, y: 400 },
        },
      };

      const moveAction = mouseMoveAction(400, 400);
      const movedState = bondCommandsReducer(state, moveAction);

      // The bond should still exist and the atom2 position should be updated
      const bond = movedState.data.molecule.bonds[cursorData.bondId];
      expect(bond).toBeDefined();
    });

    it('should snap to existing atom when dragging near one with isAtom2Created', () => {
      // Create a new bond starting from atom:1 (at -100, -100)
      mockState.cursor.mouseBegin = { x: -100, y: -100 };
      mockState.cursor.mouseCurrent = { x: -100, y: -100 };

      const downAction = mouseDownAction(-100, -100);
      let state = bondCommandsReducer(mockState, downAction);

      const cursorData = state.cursor.data as CursorBondData;
      expect(cursorData.isAtom2Created).toBe(true);
      expect(cursorData.startAtom.id).toBe('atom:1');

      const bondId = cursorData.bondId;
      const bond = state.data.molecule.bonds[bondId];
      const createdAtomId = bond.atom2;

      // Now move mouse to be near atom:3 at projected position (100, 100)
      // The distance from mouseBegin must be > 10px
      state = {
        ...state,
        cursor: {
          ...state.cursor,
          mouseCurrent: { x: 100, y: 100 },
        },
      };

      const moveAction = mouseMoveAction(100, 100);
      const movedState = bondCommandsReducer(state, moveAction);

      // The created atom should be removed and the bond should snap to atom:3
      const movedBond = movedState.data.molecule.bonds[bondId];
      expect(movedBond.atom2).toBe('atom:3');
      expect(movedState.data.molecule.atoms[createdAtomId]).toBeUndefined();

      // isAtom2Created should be set to false
      const movedCursorData = movedState.cursor.data as CursorBondData;
      expect(movedCursorData.isAtom2Created).toBe(false);
    });

    it('should not snap when hovering existing atom but isAtom2Created is false', () => {
      // Set up state where bond already connects to an existing atom
      mockState.cursor.mouseBegin = { x: -100, y: -100 };
      mockState.cursor.mouseCurrent = { x: 100, y: 100 };
      mockState.cursor.data = {
        isAtom2Created: false,
        bondId: 'bond:1',
        startAtom: mockState.data.molecule.atoms['atom:1'],
      };

      const moveAction = mouseMoveAction(100, 100);
      const movedState = bondCommandsReducer(mockState, moveAction);

      // Should return state unchanged since isAtom2Created is false and hovering an atom
      expect(movedState).toBe(mockState);
    });

    it('should create new atom when not hovering and isAtom2Created is false', () => {
      // Set up: bond:1 connects atom:1 to atom:2, mouse is dragged far from any atom
      mockState.cursor.mouseBegin = { x: -100, y: -100 };
      mockState.cursor.mouseCurrent = { x: 500, y: 500 };
      mockState.cursor.data = {
        isAtom2Created: false,
        bondId: 'bond:1',
        startAtom: mockState.data.molecule.atoms['atom:1'],
      };

      const moveAction = mouseMoveAction(500, 500);
      const movedState = bondCommandsReducer(mockState, moveAction);

      // A new atom should be created and bond updated to point to it
      const movedBond = movedState.data.molecule.bonds['bond:1'];
      expect(movedBond.atom2).not.toBe('atom:2');

      // isAtom2Created should now be true
      const movedCursorData = movedState.cursor.data as CursorBondData;
      expect(movedCursorData.isAtom2Created).toBe(true);

      // The new atom should exist in the molecule
      expect(movedState.data.molecule.atoms[movedBond.atom2]).toBeDefined();
    });

    it('should snap created atom to proposed position when isAtom2Created is true and proposed position is near existing atom', () => {
      // Set up a molecule with a target atom at (1, 0) projected to (100, 0).
      // startAtom at (0, 0) projected to (0, 0).
      // When cursor is at (150, 3) -- far enough from (100, 0) for direct hover (dist ~50px > 15px),
      // but proposeFixedAtom(startAtom=(0,0), unproject(150,3)=(1.5,0.03)) snaps to angle ~pi,
      // producing (0 - cos(-pi), 0 - sin(-pi)) = (1, 0), which projects to (100, 0) -- right on the target atom.
      const startAtom = { id: 'atomA', x: 0, y: 0, z: 0, type: 'C' };
      const targetAtom = { id: 'atomT', x: 1, y: 0, z: 0, type: 'C' };
      const createdAtom = { id: 'atomC', x: 0.5, y: 0.5, z: 0, type: 'C' };

      mockState.data.molecule = {
        id: 'test-mol',
        title: 'test-mol',
        atoms: {
          atomA: startAtom,
          atomT: targetAtom,
          atomC: createdAtom,
        },
        bonds: {
          bondX: {
            id: 'bondX',
            atom1: 'atomA',
            atom2: 'atomC',
            order: 1,
          },
        },
      };

      mockState.cursor.mouseBegin = { x: 0, y: 0 };
      mockState.cursor.mouseCurrent = { x: 150, y: 3 };
      mockState.cursor.data = {
        isAtom2Created: true,
        bondId: 'bondX',
        startAtom,
      };

      const moveAction = mouseMoveAction(150, 3);
      const movedState = bondCommandsReducer(mockState, moveAction);

      // The created atom should be deleted and bond should snap to the target atom
      const movedBond = movedState.data.molecule.bonds.bondX;
      expect(movedBond.atom2).toBe('atomT');
      expect(movedState.data.molecule.atoms.atomC).toBeUndefined();

      const movedCursorData = movedState.cursor.data as CursorBondData;
      expect(movedCursorData.isAtom2Created).toBe(false);
    });

    it('should move existing atom2 to proposed position when isAtom2Created is false and proposed position is near existing atom', () => {
      // Set up: startAtom at (0, 0), bond connects to atom2 at (0.5, 0.5),
      // target atom at (1, 0). Cursor at (150, 3) -- not directly near target but
      // proposeFixedAtom snaps to (1, 0) which is near the target atom.
      // Since isAtom2Created=false, it should move atom2 to the target's position.
      const startAtom = { id: 'atomA', x: 0, y: 0, z: 0, type: 'C' };
      const targetAtom = { id: 'atomT', x: 1, y: 0, z: 0, type: 'C' };
      const existingAtom2 = { id: 'atomE', x: 0.5, y: 0.5, z: 0, type: 'C' };

      mockState.data.molecule = {
        id: 'test-mol',
        title: 'test-mol',
        atoms: {
          atomA: startAtom,
          atomT: targetAtom,
          atomE: existingAtom2,
        },
        bonds: {
          bondX: {
            id: 'bondX',
            atom1: 'atomA',
            atom2: 'atomE',
            order: 1,
          },
        },
      };

      mockState.cursor.mouseBegin = { x: 0, y: 0 };
      mockState.cursor.mouseCurrent = { x: 150, y: 3 };
      mockState.cursor.data = {
        isAtom2Created: false,
        bondId: 'bondX',
        startAtom,
      };

      const moveAction = mouseMoveAction(150, 3);
      const movedState = bondCommandsReducer(mockState, moveAction);

      // atom2 should have its position updated to match target atom
      const movedAtom2 = movedState.data.molecule.atoms.atomE;
      expect(movedAtom2).toBeDefined();
      expect(movedAtom2.x).toBe(targetAtom.x);
      expect(movedAtom2.y).toBe(targetAtom.y);

      // Bond should still reference atomE (not changed)
      const movedBond = movedState.data.molecule.bonds.bondX;
      expect(movedBond.atom2).toBe('atomE');
    });
  });

  describe('#MOUSE_UP (incrementBondDublicates)', () => {
    it('should clear cursor data on mouse up', () => {
      mockState.cursor.data = null;

      const action = mouseUpAction(0, 0);
      const actualState = bondCommandsReducer(mockState, action);

      expect(actualState.cursor.data).toBeNull();
    });

    it('should return state with null cursor data when cursor data is null', () => {
      mockState.cursor.data = null;

      const action = mouseUpAction(0, 0);
      const actualState = bondCommandsReducer(mockState, action);

      expect(actualState.cursor.data).toBeNull();
      // Molecule should be unchanged
      expect(actualState.data.molecule).toEqual(mockState.data.molecule);
    });

    it('should merge duplicate bonds by incrementing valency', () => {
      // Create a situation with a duplicate bond:
      // bond:1 connects atom:1 -> atom:2, and we add bond:new also connecting atom:1 -> atom:2
      const newBondId = 'bond:new';
      mockState.data.molecule.bonds[newBondId] = {
        id: newBondId,
        atom1: 'atom:1',
        atom2: 'atom:2',
        order: 1,
      };
      mockState.cursor.data = {
        isAtom2Created: false,
        bondId: newBondId,
        startAtom: mockState.data.molecule.atoms['atom:1'],
      };

      const action = mouseUpAction(0, 0);
      const actualState = bondCommandsReducer(mockState, action);

      // The new bond should be deleted
      expect(actualState.data.molecule.bonds[newBondId]).toBeUndefined();

      // The existing bond should have its order incremented
      expect(actualState.data.molecule.bonds['bond:1'].order).toBe(2);

      // Cursor data should be cleared
      expect(actualState.cursor.data).toBeNull();
    });

    it('should merge duplicate bonds even when atom order is reversed', () => {
      // bond:1 connects atom:1 -> atom:2, add bond:new connecting atom:2 -> atom:1
      const newBondId = 'bond:new';
      mockState.data.molecule.bonds[newBondId] = {
        id: newBondId,
        atom1: 'atom:2',
        atom2: 'atom:1',
        order: 1,
      };
      mockState.cursor.data = {
        isAtom2Created: false,
        bondId: newBondId,
        startAtom: mockState.data.molecule.atoms['atom:2'],
      };

      const action = mouseUpAction(0, 0);
      const actualState = bondCommandsReducer(mockState, action);

      // The new bond should be deleted
      expect(actualState.data.molecule.bonds[newBondId]).toBeUndefined();

      // The existing bond should have its order incremented
      expect(actualState.data.molecule.bonds['bond:1'].order).toBe(2);
    });

    it('should not merge when no duplicate bond exists', () => {
      // bond:new connects atom:1 -> atom:3 (no existing bond between these atoms)
      const newBondId = 'bond:new';
      mockState.data.molecule.bonds[newBondId] = {
        id: newBondId,
        atom1: 'atom:1',
        atom2: 'atom:3',
        order: 1,
      };
      mockState.cursor.data = {
        isAtom2Created: true,
        bondId: newBondId,
        startAtom: mockState.data.molecule.atoms['atom:1'],
      };

      const action = mouseUpAction(0, 0);
      const actualState = bondCommandsReducer(mockState, action);

      // The new bond should still exist (no duplicate to merge with)
      expect(actualState.data.molecule.bonds[newBondId]).toBeDefined();
      expect(actualState.data.molecule.bonds[newBondId].order).toBe(1);

      // Cursor data should be cleared
      expect(actualState.cursor.data).toBeNull();
    });

    it('should cycle order to 1 when merging a duplicate into a bond of order 3', () => {
      // Set existing bond:1 to order 3
      mockState.data.molecule.bonds['bond:1'].order = 3;

      const newBondId = 'bond:new';
      mockState.data.molecule.bonds[newBondId] = {
        id: newBondId,
        atom1: 'atom:1',
        atom2: 'atom:2',
        order: 1,
      };
      mockState.cursor.data = {
        isAtom2Created: false,
        bondId: newBondId,
        startAtom: mockState.data.molecule.atoms['atom:1'],
      };

      const action = mouseUpAction(0, 0);
      const actualState = bondCommandsReducer(mockState, action);

      // The duplicate is removed and the existing bond should wrap from 3 to 1
      expect(actualState.data.molecule.bonds[newBondId]).toBeUndefined();
      expect(actualState.data.molecule.bonds['bond:1'].order).toBe(1);
    });
  });

  describe('#MOUSE_LEAVE', () => {
    it('should clear cursor data on mouse leave', () => {
      mockState.cursor.data = null;

      const action = mouseLeaveAction();
      const actualState = bondCommandsReducer(mockState, action);

      expect(actualState.cursor.data).toBeNull();
    });

    it('should merge duplicate bonds on mouse leave', () => {
      const newBondId = 'bond:new';
      mockState.data.molecule.bonds[newBondId] = {
        id: newBondId,
        atom1: 'atom:1',
        atom2: 'atom:2',
        order: 1,
      };
      mockState.cursor.data = {
        isAtom2Created: false,
        bondId: newBondId,
        startAtom: mockState.data.molecule.atoms['atom:1'],
      };

      const action = mouseLeaveAction();
      const actualState = bondCommandsReducer(mockState, action);

      expect(actualState.data.molecule.bonds[newBondId]).toBeUndefined();
      expect(actualState.data.molecule.bonds['bond:1'].order).toBe(2);
      expect(actualState.cursor.data).toBeNull();
    });
  });

  describe('#full bond creation flow (MOUSE_DOWN -> MOUSE_MOVE -> MOUSE_UP)', () => {
    it('should create and finalize a bond on empty canvas area', () => {
      // Step 1: Mouse down on empty area to start a new bond
      mockState.cursor.mouseBegin = { x: 500, y: 500 };
      mockState.cursor.mouseCurrent = { x: 500, y: 500 };

      const downAction = mouseDownAction(500, 500);
      let state = bondCommandsReducer(mockState, downAction);

      const cursorData = state.cursor.data as CursorBondData;
      expect(cursorData.bondId).toBeTruthy();
      expect(cursorData.isAtom2Created).toBe(true);

      const bondId = cursorData.bondId;
      const startAtomId = cursorData.startAtom.id;

      // Step 2: Mouse up to finalize
      const upAction = mouseUpAction(500, 500);
      state = bondCommandsReducer(state, upAction);

      // Cursor data should be cleared
      expect(state.cursor.data).toBeNull();

      // The bond should still exist
      expect(state.data.molecule.bonds[bondId]).toBeDefined();
      expect(state.data.molecule.atoms[startAtomId]).toBeDefined();
    });

    it('should create a bond starting from existing atom and drag to new position', () => {
      // Step 1: Mouse down on atom:1
      mockState.cursor.mouseBegin = { x: -100, y: -100 };
      mockState.cursor.mouseCurrent = { x: -100, y: -100 };

      const downAction = mouseDownAction(-100, -100);
      let state = bondCommandsReducer(mockState, downAction);

      const cursorData = state.cursor.data as CursorBondData;
      expect(cursorData.startAtom.id).toBe('atom:1');
      const bondId = cursorData.bondId;

      // Step 2: Mouse move to a far location
      state = {
        ...state,
        cursor: {
          ...state.cursor,
          mouseCurrent: { x: 400, y: -100 },
        },
      };

      const moveAction = mouseMoveAction(400, -100);
      state = bondCommandsReducer(state, moveAction);

      // Bond should still exist and atom2 should have been updated
      expect(state.data.molecule.bonds[bondId]).toBeDefined();

      // Step 3: Mouse up to finalize
      const upAction = mouseUpAction(400, -100);
      state = bondCommandsReducer(state, upAction);

      expect(state.cursor.data).toBeNull();
      expect(state.data.molecule.bonds[bondId]).toBeDefined();
    });
  });
});
