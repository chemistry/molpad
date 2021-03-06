import {
  JMol,
} from "../../declarations";
export const CYCLOBUTANE = {
   atoms: [
     [0.0000, 0.0000, 0.0000, "C"],
     [1.0000, 0.0000, 0.0000, "C"],
     [1.0000, 1.0000, 0.0000, "C"],
     [0.0000, 1.0000, 0.0000, "C"],
   ],
   bonds: [
       [1, 2, 1],
       [2, 3, 1],
       [3, 4, 1],
       [4, 1, 1],
   ],
   id: "cyclobutane",
   title: "cyclobutane",
   order: -1,
} as JMol;
