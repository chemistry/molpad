export interface ToolBarConfingModel {
    name: string;
    data: ToolBarIntemConfigModel[];
}

export interface ToolBarIntemConfigModel {
    title: string;
    icon: string;
    action?: () => {};
}

export interface IMolPadStore {
    mode: IMolPadMode;
    history: IMolPadData[];
    data: IMolPadData;
}

export interface IMolPadData {
    molecule: object;
    camera: object;
}

export interface IMolPadMode {
    mode: MolPadMode;
    type: string | object;
}

export enum MolPadMode {
    atom = "atom",
    bond = "bond",
    fragment = "fragment",
}

export interface Vec2 {
    x: number;
    y: number;
}
