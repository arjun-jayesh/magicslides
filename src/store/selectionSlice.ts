import { StateCreator } from 'zustand';
import { Identifier } from '@/models/types';

export interface SelectionState {
    selectedIds: Identifier[];
}

export interface SelectionActions {
    select: (id: Identifier | Identifier[]) => void;
    deselect: (id: Identifier | Identifier[]) => void;
    clearSelection: () => void;
    toggleSelection: (id: Identifier) => void;
}

export interface SelectionSlice extends SelectionState, SelectionActions { }

// Using 'any' for set/state to avoid complex generic middleware typing battles
// We know this is used inside an Immer middleware store.
export const createSelectionSlice: StateCreator<
    SelectionSlice,
    [],
    [],
    SelectionSlice
> = (set: any) => ({
    selectedIds: [],
    select: (ids) => set((state: any) => {
        state.selectedIds = Array.isArray(ids) ? ids : [ids];
    }),
    deselect: (ids) => set((state: any) => {
        const toRemove = new Set(Array.isArray(ids) ? ids : [ids]);
        state.selectedIds = state.selectedIds.filter((id: any) => !toRemove.has(id));
    }),
    clearSelection: () => set((state: any) => {
        state.selectedIds = [];
    }),
    toggleSelection: (id) => set((state: any) => {
        const idx = state.selectedIds.indexOf(id);
        if (idx !== -1) {
            state.selectedIds.splice(idx, 1);
        } else {
            state.selectedIds.push(id);
        }
    }),
});
