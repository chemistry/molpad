import React from 'react';
import {
  clearAllAction,
  redoAction,
  undoAction,
  zoomInAction,
  zoomOutAction,
} from '../../../actions/index.js';
import { ToolMode } from '../../../declarations/index.js';
import type { StoreState } from '../../../declarations/index.js';
import { CameraHelperService } from '../../../services/index.js';
import { useMolpadStore } from '../../../store/index.js';
import { ToolBarOrientation } from '../../../widgets/index.js';
import type { ToolBarItemConfig } from '../../../widgets/toolbar-item/toolbar-item.js';
import { GenericToolBar } from '../generic-toolbar/index.js';

import './icons/icons.css';

export const TOOLBAR_TOP_CONFIG: ToolBarItemConfig[] = [
  {
    id: 'NEW',
    title: 'New',
    iconClassName: 'c-toolbar-item--new-file',
    isDisabled: (state: StoreState) => {
      const atoms = state.data.molecule.atoms;
      const bonds = state.data.molecule.bonds;
      return Object.keys(atoms).length === 0 && Object.keys(bonds).length === 0;
    },
  },
  {
    id: 'UNDO',
    title: 'Undo',
    iconClassName: 'c-toolbar-item--undo',
    isDisabled: (state: StoreState) => {
      return state.pastData.length === 0;
    },
  },
  {
    id: 'REDO',
    title: 'Redo',
    iconClassName: 'c-toolbar-item--redo',
    isDisabled: (state: StoreState) => {
      return state.futureData.length === 0;
    },
  },
  {
    id: 'ZOOM_OUT',
    title: 'Zoom Out',
    iconClassName: 'c-toolbar-item--zoom-out',
    isDisabled: (state: StoreState) => {
      return !CameraHelperService.canZoomOut(state.data.camera);
    },
  },
  {
    id: 'ZOOM_IN',
    title: 'Zoom In',
    iconClassName: 'c-toolbar-item--zoom-in',
    isDisabled: (state: StoreState) => {
      return !CameraHelperService.canZoomIn(state.data.camera);
    },
  },
  {
    id: 'CLEAR',
    title: 'Clear',
    iconClassName: 'c-toolbar-item--clear',
    mode: ToolMode.clear,
    type: '#',
    isDisabled: (state: StoreState) => {
      const atoms = state.data.molecule.atoms;
      const bonds = state.data.molecule.bonds;
      return Object.keys(atoms).length === 0 && Object.keys(bonds).length === 0;
    },
  },
];

export const TopToolBar = () => {
  const dispatch = useMolpadStore((state) => state.dispatch);

  const handleActions = (item: ToolBarItemConfig) => {
    switch (item.id) {
      case 'NEW':
        dispatch(clearAllAction());
        break;
      case 'UNDO':
        dispatch(undoAction());
        break;
      case 'REDO':
        dispatch(redoAction());
        break;
      case 'ZOOM_IN':
        dispatch(zoomInAction());
        break;
      case 'ZOOM_OUT':
        dispatch(zoomOutAction());
        break;
      default:
        break;
    }
  };

  return (
    <GenericToolBar
      data={TOOLBAR_TOP_CONFIG}
      orientation={ToolBarOrientation.top}
      onItemClicked={handleActions}
    />
  );
};
