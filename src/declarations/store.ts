import {
    JMol,
} from "./jmol";
import {
    JMolWrapModel,
} from "./wrap.models";

export interface StoreState {
    toolbar: ToolBarState;
    cursor: CursorState;
    pastData: DataModelState[];
    futureData: DataModelState[];
    data: DataModelState;
    cache: JMolCache;
    settings: UserSettingsState;
    isTableShown: boolean;
}

export interface UserSettingsState {
    additionalElements: string[];
}

export enum ToolMode {
    none = "none",
    atom = "atom",
    bond = "bond",
    clear = "clear",
    fragment = "fragment",
}

export interface ToolBarState  {
    mode: ToolMode;
    type: string;
}

export interface CameraState {
    translation: {
        x: number;
        y: number;
    };
    scale: number;
}

export interface JMolBondsClassification {
    [bondId: string]: number;
}

export interface JMolCache {
    bondsClasification: JMolBondsClassification;
}

export interface CursorState {
    mouseClick: boolean;
    mouseBegin: {
        x: number,
        y: number,
    };
    mouseCurrent: {
        x: number,
        y: number,
    };
    data: object | null;
}

export interface DataModelState {
    molecule: JMolWrapModel;
    camera: CameraState;
}
