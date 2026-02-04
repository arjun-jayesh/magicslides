import { StateCreator } from 'zustand';
import { Patch } from 'immer';

export interface HistoryState {
    past: Patch[][];
    future: Patch[][];
}

export interface HistoryActions {
    undo: () => void;
    redo: () => void;
    capture: (description?: string) => void;
}

// Placeholder for now to satisfy build. 
// Real implementation requires middleware integration which is complex to type strictly in one shot.
// We will export types but ensure no runtime errors or unused var errors.

export type HistorySlice = HistoryState & HistoryActions;

export const createHistorySlice: StateCreator<
    HistorySlice,
    [],
    [],
    HistorySlice
> = (_set) => ({
    past: [],
    future: [],
    undo: () => { console.log("Undo"); },
    redo: () => { console.log("Redo"); },
    capture: () => { console.log("Capture"); }
});
