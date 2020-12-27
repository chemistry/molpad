import {
  JMol,
} from "../../declarations";
export const CYCLOPENTANE = {
   atoms: [
     [0.3005, 0.0000, 0.0000, "C"],
     [1.3020, 0.0000, 0.0000, "C"],
     [1.6024, 0.9514, 0.0000, "C"],
     [0.8012, 1.5523, 0.0000, "C"],
     [0.0000, 0.9514, 0.0000, "C"],
   ],
   bonds: [
       [1, 2, 1],
       [2, 3, 1],
       [3, 4, 1],
       [4, 5, 1],
       [5, 1, 1],
   ],
   id: "cyclopentane",
   title: "cyclopentane",
   order: -1,
} as  JMol;
