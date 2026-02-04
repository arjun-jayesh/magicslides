/**
 * MAGIC SLIDE - STATE CONTRACT
 * 
 * 1. The Zustand Store is the SINGLE SOURCE OF TRUTH.
 * 2. Konva nodes are strictly derivational views of the Store.
 * 3. Konva node state (x, y, scale) MUST NOT be used as truth.
 * 4. Mutations flow ONE WAY: UI Event -> Store Action -> State Update -> Canvas Re-render.
 */

export interface CanonicalState {
    // We will define the exact types in Module 2, 
    // but this contract defines the structure's behavior.

    /**
     * Returns a JSON-serializable snapshot of the current project.
     * This must strip all runtime-only state (selections, history).
     */
    serialize(): string;

    /**
     * Fully replaces the current state with a dehydrated snapshot.
     * Must validate schema before applying.
     */
    hydrate(json: string): void;
}

export const STATE_VERSION = 1;

/**
 * Definition of what persists.
 */
export interface Persistable {
    version: number;
    updatedAt: number;
}
