export interface JMolWrapModel {
    id: string;
    title: string;
    atoms: JMolAtomWrapCollection;
    bonds: JMolBondWrapCollection;
}

export interface JMolAtomWrapCollection {
    [key: string]: JMolAtomWrap;
}

export interface JMolBondWrapCollection {
    [key: string]: JMolBondWrap;
}

export interface JMolAtomWrap {
    id: string;
    x: number;
    y: number;
    z: number;
    type: string;
}

export interface JMolBondWrap {
    id: string;
    atom1: string;
    atom2: string;
    order: number;
}
