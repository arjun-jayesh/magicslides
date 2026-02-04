export type Identifier = string;

// --- PRIMITIVES ---

export interface Dimensions {
    width: number;
    height: number;
}

export interface Position {
    x: number;
    y: number;
}

export interface Rotation {
    rotation: number; // degrees
}

export enum AspectRatio {
    RATIO_1_1 = '1:1',
    RATIO_16_9 = '16:9',
    RATIO_4_5 = '4:5',
}

export interface FilterConfig {
    blur: number; // 0-100
    brightness: number; // -1 to 1 (0 default)
    contrast: number; // -1 to 1 (0 default)
    saturation: number; // -1 to 1 (0 default)
    opacity?: number; // 0-1
}

export interface GradientConfig {
    enabled: boolean;
    colors: string[]; // [start, end]
    angle: number; // 0-360
}

export interface GlassOverlay {
    enabled: boolean;
    backgroundColor: string;
    backdropFilter: string;
    borderRadius: number;
    border: string;
    padding: number;
    opacity: number;
}

// --- ELEMENTS ---

export enum ElementType {
    TEXT = 'text',
    IMAGE = 'image',
    SHAPE = 'shape',
}

export interface BaseElement extends Dimensions, Position, Rotation {
    id: Identifier;
    type: ElementType;
    opacity: number;
    zIndex: number; // V2 Parity
    locked: boolean;
    name?: string;
    metadata?: Record<string, any>;
    // V3 Enhancement: Styling
    cornerRadius?: number;
    stroke?: string;
    strokeWidth?: number;
}

export interface TextElement extends BaseElement {
    type: ElementType.TEXT;
    content: string;
    fontSize: number;
    fontFamily: string;
    fontWait: number | string;
    fill: string;
    gradient?: GradientConfig; // V2 Parity
    align: 'left' | 'center' | 'right' | 'justify';
    verticalAlign: 'top' | 'middle' | 'bottom'; // V2 Parity
    lineHeight: number;
    autoWidth: boolean;
    autoHeight: boolean;
}

export interface ImageElement extends BaseElement {
    type: ElementType.IMAGE;
    src: string;
    alt?: string;
    maintainAspectRatio: boolean;
    filters?: FilterConfig; // V2 Parity
    crop?: { x: number, y: number, width: number, height: number };
}

export interface ShapeElement extends BaseElement {
    type: ElementType.SHAPE;
    shapeType: 'rect' | 'circle' | 'line';
    fill: string;
    stroke: string;
    strokeWidth: number;
}

export type CanvasElement = TextElement | ImageElement | ShapeElement;

// --- STRUCTURE ---

export enum SlideLayoutType {
    TITLE = 'title',
    CONTENT = 'content',
    NUMBERED = 'numbered',
    COMPARISON = 'comparison',
    COMPARISON_IMAGE = 'comparison_image',
    IMAGE_ONLY = 'image_only',
    IMAGE_TEXT = 'image_text',
    HEADING = 'heading',
    CTA = 'cta'
}

export interface Slide {
    id: Identifier;
    elements: CanvasElement[];
    order: number;
    backgroundColor: string;
    backgroundImage?: string; // V2 Parity
    backgroundFilters: FilterConfig; // V2 Parity
    backgroundScale?: number; // For "Crop" / Zoom
    backgroundPosition?: { x: number, y: number }; // For Pan
    thumbnail?: string; // Base64 preview
    layoutType?: SlideLayoutType;
    glassOverlay?: GlassOverlay;
}

export interface Project {
    id: Identifier;
    version: number;
    title: string;
    slides: Slide[];
    createdAt: number;
    updatedAt: number;
    aspectRatio: AspectRatio; // V2 Parity
    theme: Identifier;
}

// --- TEMPLATES ---

export interface Slot {
    id: Identifier;
    type: ElementType;
    rect: Dimensions & Position;
    constraints?: {
        charLimit?: number;
        sentenceLimit?: number; // V2 Parity
        allowedFonts?: string[];
    };
}

export interface Template {
    id: Identifier;
    name: string;
    version: number;
    aspectRatio: AspectRatio; // V2 specific templates?
    slots: Slot[];
    backgroundElements: CanvasElement[];
}

export interface LayoutPreset {
    id: Identifier;
    name: string;
    fonts: {
        heading: string;
        body: string;
        accent?: string;
    };
    colorPalette: {
        primary: string;
        secondary: string;
        background: string;
        text: string;
        accent?: string;
    };
    filterDefaults: FilterConfig;
    glassSettings: Partial<GlassOverlay>;
    spacing: number;
}
