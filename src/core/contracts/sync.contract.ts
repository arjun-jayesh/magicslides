/**
 * MAGIC SLIDE - SYNC CONTRACT
 * 
 * Rules for synchronizing the visual canvas with the data store.
 */

import { toCanonical } from './math.contract';

/**
 * Validates that a UI transform event is safe to apply to the store.
 * e.g. preventing negative sizing.
 */
export function validateTransform(width: number, height: number): { valid: boolean; correctedWidth: number; correctedHeight: number } {
    const w = toCanonical(width);
    const h = toCanonical(height);

    if (w < 0 || h < 0) {
        return {
            valid: false,
            correctedWidth: Math.max(1, Math.abs(w)),
            correctedHeight: Math.max(1, Math.abs(h))
        };
    }

    return { valid: true, correctedWidth: w, correctedHeight: h };
}

/**
 * Sync Policy:
 * 1. On DragStart: Store captures initial state.
 * 2. On DragMove: Visuals update via ref (optimistic UI), Store is NOT updated.
 * 3. On DragEnd: Final coordinates are canonicalized and sent to Store.
 * 
 * This prevents thrashing the store with 60fps updates while keeping UI smooth.
 */
export const SYNC_POLICY = {
    BATCH_UPDATES: true,
    OPTIMISTIC_DRAG: true,
    ROUND_ON_SET: true
} as const;
