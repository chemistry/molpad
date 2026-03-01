import { JMol } from '../../declarations/index.js';
export const BENZENE = {
  atoms: [
    [1.905, -0.7932, 0.0, 'C'],
    [1.905, -2.1232, 0.0, 'C'],
    [0.7531, -2.7882, 0.0, 'C'],
    [-0.3987, -2.1232, 0.0, 'C'],
    [-0.3987, -0.7932, 0.0, 'C'],
    [0.7531, -0.1282, 0.0, 'C'],
  ],
  bonds: [
    [1, 2, 2],
    [2, 3, 1],
    [3, 4, 2],
    [4, 5, 1],
    [5, 6, 2],
    [6, 1, 1],
  ],
  id: 'benzene',
  title: 'benzene',
  order: 1,
} as JMol;
