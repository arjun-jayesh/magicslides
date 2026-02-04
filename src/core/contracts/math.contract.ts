/**
 * MAGIC SLIDE - MATH CONTRACT (V2)
 * 
 * Supports dynamic stage sizing while maintaining coordinate precision.
 */

// Precision level for all coordinate storage
export const PRECISION = 2;

/**
 * Rounds a number to the canonical precision.
 */
export function toCanonical(value: number): number {
    return Number(value.toFixed(PRECISION));
}

export function areEqual(a: number, b: number): boolean {
    return Math.abs(a - b) < Number.EPSILON;
}

export function clamp(value: number, min: number, max: number): number {
    return toCanonical(Math.min(Math.max(value, min), max));
}

// Base Dimension is 1080px (Width is always locked, height varies)
export const BASE_WIDTH = 1080;

export const RATIO_MAP = {
    '1:1': { width: 1080, height: 1080 },
    '16:9': { width: 1080, height: 608 }, // (1080 * 9 / 16) = 607.5 -> 608
    '4:5': { width: 1080, height: 1350 }, // (1080 * 5 / 4)
};

export type AspectRatioKey = keyof typeof RATIO_MAP;

export const CANVAS_WIDTH = 1080; // LEGACY EXPORT for compatibility
export const CANVAS_HEIGHT = 1080; // LEGACY

export function getCanvasDimensions(ratio: AspectRatioKey | string) {
    if (ratio in RATIO_MAP) {
        return RATIO_MAP[ratio as AspectRatioKey];
    }
    return RATIO_MAP['1:1'];
}
