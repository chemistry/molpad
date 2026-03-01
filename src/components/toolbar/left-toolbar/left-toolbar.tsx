import React from 'react';
import { ToolMode } from '../../../declarations/index.js';
import { ToolBarOrientation } from '../../../widgets/index.js';
import { GenericToolBar } from '../generic-toolbar/index.js';
import './icons/icons.css';

export const TOOLBAR_LEFT_CONFIG = [
  {
    title: '',
    name: '',
    mode: ToolMode.bond,
    type: '1',
    iconClassName: 'c-toolbar-item--bond-single',
  },
  {
    title: '',
    name: '',
    mode: ToolMode.bond,
    type: '2',
    iconClassName: 'c-toolbar-item--bond-double',
  },
  {
    title: '',
    name: '',
    mode: ToolMode.bond,
    type: '3',
    iconClassName: 'c-toolbar-item--bond-triple',
  },
  {
    title: '',
    name: '',
    mode: ToolMode.fragment,
    type: 'benzene',
    iconClassName: 'c-toolbar-item--fragment-benzene',
  },
  {
    title: '',
    name: '',
    mode: ToolMode.fragment,
    type: 'cyclohexane',
    iconClassName: 'c-toolbar-item--fragment-cyclohexane',
  },
  {
    title: '',
    name: '',
    mode: ToolMode.fragment,
    type: 'cyclopentane',
    iconClassName: 'c-toolbar-item--fragment-cyclopentane',
  },
  {
    title: '',
    name: '',
    mode: ToolMode.fragment,
    type: 'cyclobutane',
    iconClassName: 'c-toolbar-item--fragment-cyclobutane',
  },
];

export const LeftToolBar = () => {
  return <GenericToolBar data={TOOLBAR_LEFT_CONFIG} orientation={ToolBarOrientation.left} />;
};
