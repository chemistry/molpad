import { JMol } from '../../declarations/index.js';
export const CYCLOBUTANE = {
  atoms: [
    [0.0, 0.0, 0.0, 'C'],
    [1.0, 0.0, 0.0, 'C'],
    [1.0, 1.0, 0.0, 'C'],
    [0.0, 1.0, 0.0, 'C'],
  ],
  bonds: [
    [1, 2, 1],
    [2, 3, 1],
    [3, 4, 1],
    [4, 1, 1],
  ],
  id: 'cyclobutane',
  title: 'cyclobutane',
  order: -1,
} as JMol;
