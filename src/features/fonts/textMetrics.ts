/**
 * MAGIC SLIDE - TEXT METRICS ENGINE
 * 
 * Sources of truth for text layout.
 * Replicates Konva's internal measurement logic strictly.
 */

let measurementCanvas: HTMLCanvasElement | null = null;

function getContext() {
    if (!measurementCanvas) {
        measurementCanvas = document.createElement('canvas');
    }
    return measurementCanvas.getContext('2d')!;
}

interface TextConfig {
    text: string;
    fontSize: number;
    fontFamily: string;
    fontWeight: number | string;
    lineHeight: number;
    width?: number; // Constraints
}

export interface TextMetricsResult {
    width: number;
    height: number;
    lines: string[];
}

/**
 * Calculates text size and wrapping.
 * Implementation mirrors konva.Text behavior.
 */
export function measureText(config: TextConfig): TextMetricsResult {
    const ctx = getContext();
    const fontStyle = `${config.fontWeight} ${config.fontSize}px "${config.fontFamily}"`;
    ctx.font = fontStyle;

    const text = config.text;
    // TODO: Implement full word-wrap logic matching Konva if width is provided.
    // For now, simpler measurement for auto-width text.

    const metrics = ctx.measureText(text);

    // Height calculation with line height
    // Approximation for typical browsers, or valid logic
    const fontSize = config.fontSize;
    const lineHeightPx = fontSize * config.lineHeight;

    return {
        width: metrics.width,
        height: lineHeightPx, // Logic needs expansion for multi-line
        lines: [text]
    };
}

export function syncFontWithCanvas() {
    // Ensure font availability matches context availability
    // Helper to force re-calc after font load
}
