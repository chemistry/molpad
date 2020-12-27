import {
    JMol,
    ToolMode,
} from "../declarations";

import * as constants from "../declarations/constants";

export interface SetToolModeAction {
    type: constants.SET_TOOL_MODE;
    payload: { mode: ToolMode, type: string };
}

export interface LoadMoleculeAction {
    type: constants.LOAD_MOLECULE;
    payload: { molecule: JMol };
}

export interface ClearAllAction {
    type: constants.CLEAR_ALL;
}

export interface UndoAction {
    type: constants.UNDO;
}

export interface RedoAction {
    type: constants.REDO;
}

export interface ZoomInAction {
    type: constants.ZOOM_IN;
}

export interface ZoomOutAction {
    type: constants.ZOOM_OUT;
}

export interface ShowPeriodicTableAction {
    type: constants.SHOW_PERIODIC_TABLE;
}

export interface HidePeriodicTableAction {
    type: constants.HIDE_PERIODIC_TABLE;
    payload: {
        selected: string,
    };
}

export interface MouseDownAction {
    type: constants.MOUSE_DOWN;
    payload: {
        x: number,
        y: number,
    };
}

export interface MouseMoveAction {
    type: constants.MOUSE_MOVE;
    payload: {
        x: number,
        y: number,
    };
}

export interface MouseUpAction {
    type: constants.MOUSE_UP;
    payload: {
        x: number,
        y: number,
    };
}

export interface MouseLeaveAction {
    type: constants.MOUSE_LEAVE;
}

export type Actions
    = SetToolModeAction
    | ClearAllAction
    | LoadMoleculeAction
    | UndoAction
    | RedoAction
    | ZoomInAction
    | ZoomOutAction
    | ShowPeriodicTableAction
    | HidePeriodicTableAction
    | MouseDownAction
    | MouseMoveAction
    | MouseUpAction
    | MouseLeaveAction;

export function setToolModeAction({
  mode,
  type,
}: {mode: ToolMode, type: string }): SetToolModeAction {
    return {
        type: constants.SET_TOOL_MODE,
        payload: {mode, type},
    };
}

export function clearAllAction(): ClearAllAction {
    return {
        type: constants.CLEAR_ALL,
    };
}

export function loadMoleculeAction(molecule: any): LoadMoleculeAction {
    return {
        type: constants.LOAD_MOLECULE,
        payload: { molecule },
    };
}

export function undoAction(): UndoAction {
    return {
        type: constants.UNDO,
    };
}

export function redoAction(): RedoAction {
    return {
        type: constants.REDO,
    };
}

export function zoomInAction(): ZoomInAction {
    return {
        type: constants.ZOOM_IN,
    };
}

export function zoomOutAction(): ZoomOutAction {
    return {
        type: constants.ZOOM_OUT,
    };
}

export function showPeriodicTableAction(): ShowPeriodicTableAction {
    return {
      type: constants.SHOW_PERIODIC_TABLE,
    };
}

export function hidePeriodicTableAction(selected: string): HidePeriodicTableAction {
    return {
      type: constants.HIDE_PERIODIC_TABLE,
      payload: { selected },
    };
}

export function mouseDownAction(x: number, y: number): MouseDownAction {
    return {
        type: constants.MOUSE_DOWN,
        payload: { x, y },
    };
}

export function mouseMoveAction(x: number, y: number): MouseMoveAction {
    return {
        type: constants.MOUSE_MOVE,
        payload: { x, y },
    };
}

export function mouseUpAction(x: number, y: number): MouseUpAction {
    return {
        type: constants.MOUSE_UP,
        payload: { x, y },
    };
}

export function mouseLeaveAction(): MouseLeaveAction {
    return {
        type: constants.MOUSE_LEAVE,
    };
}
