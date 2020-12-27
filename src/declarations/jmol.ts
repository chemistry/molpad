export type JMolAtom = [number, number, number, string] | [number, number, number, string, boolean, string];
export type JMolBond = [number, number, number];

export interface JMol {
    atoms: JMolAtom[];
    bonds: JMolBond[];
    id: string;
    title: string;
}
