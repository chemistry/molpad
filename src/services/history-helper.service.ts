import {
    DataModelState,
} from "../declarations";

const cloneDeep = require("lodash.clonedeep");

export const MAX_UNDO_REDO_STACK_SIZE = 20;

export interface HistoryRecords {
    pastData: DataModelState[];
    futureData: DataModelState[];
    data: DataModelState;
}

export class HisoryHelperService {

    public static saveRecoveryPoint(state: HistoryRecords): HistoryRecords {
        const clonedData = cloneDeep(state.data);
        const newPastData = state.pastData.slice(0);
        newPastData.push(clonedData);
        if (newPastData.length > MAX_UNDO_REDO_STACK_SIZE) {
            newPastData.length = MAX_UNDO_REDO_STACK_SIZE;
        }
        const newFutureData: DataModelState[] = [];
        return {
            ...state,
            pastData: newPastData,
            futureData: newFutureData,
        };
    }

    public static undoHistory(state: HistoryRecords): HistoryRecords {
        if (state.pastData.length > 0) {
            const newPastData = state.pastData.slice(0) as DataModelState[];
            const newFutureData = state.futureData.slice(0) as DataModelState[];
            const currentData: DataModelState = cloneDeep(state.data);
            newFutureData.push(currentData);
            const newData  = newPastData.pop() as DataModelState;

            return {
                ...state,
                futureData: newFutureData,
                data: newData,
                pastData: newPastData,
            };
        }
        return state;
    }

    public static redoHistory(state: HistoryRecords): HistoryRecords {
        if (state.futureData.length > 0) {
            const newPastData: DataModelState[]  = state.pastData.slice(0);
            const newFutureData: DataModelState[] = state.futureData.slice(0);
            const currentData: DataModelState = cloneDeep(state.data);
            newPastData.push(currentData);
            const newData  = newFutureData.pop() as DataModelState;

            return {
                ...state,
                futureData: newFutureData,
                data: newData,
                pastData: newPastData,
            };
        }
        return state;
    }
}
