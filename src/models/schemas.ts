import { z } from 'zod';
import { ElementType, AspectRatio } from './types';
import { toCanonical } from '../core/contracts/math.contract';

// --- HELPERS ---

const cNum = z.number().transform(val => toCanonical(val));

const positionSchema = z.object({
    x: cNum,
    y: cNum,
});

const dimensionSchema = z.object({
    width: cNum.refine(val => val >= 0, "Width must be positive"),
    height: cNum.refine(val => val >= 0, "Height must be positive"),
});

const rotationSchema = z.object({
    rotation: cNum,
});

const filterConfigSchema = z.object({
    blur: z.number().min(0).max(100).default(0),
    brightness: z.number().min(-1).max(1).default(0),
    contrast: z.number().min(-1).max(1).default(0),
    saturation: z.number().min(-1).max(1).default(0),
});

const gradientConfigSchema = z.object({
    enabled: z.boolean().default(false),
    colors: z.array(z.string()).min(2),
    angle: z.number().default(0),
});

// --- ELEMENTS ---

const baseElementSchema = z.object({
    id: z.string().uuid(),
    opacity: z.number().min(0).max(1).default(1),
    zIndex: z.number().int().default(0),
    locked: z.boolean().default(false),
    name: z.string().optional(),
}).merge(positionSchema).merge(dimensionSchema).merge(rotationSchema);

export const textElementSchema = baseElementSchema.extend({
    type: z.literal(ElementType.TEXT),
    content: z.string(),
    fontSize: cNum.refine(v => v > 0),
    fontFamily: z.string(),
    fontWait: z.union([z.number(), z.string()]).default(400),
    fill: z.string(),
    gradient: gradientConfigSchema.optional(),
    align: z.enum(['left', 'center', 'right', 'justify']),
    verticalAlign: z.enum(['top', 'middle', 'bottom']).default('top'),
    lineHeight: z.number().default(1.5),
    autoWidth: z.boolean().default(true),
    autoHeight: z.boolean().default(true),
});

export const imageElementSchema = baseElementSchema.extend({
    type: z.literal(ElementType.IMAGE),
    src: z.string(),
    alt: z.string().optional(),
    maintainAspectRatio: z.boolean().default(true),
    filters: filterConfigSchema.optional(),
});

export const shapeElementSchema = baseElementSchema.extend({
    type: z.literal(ElementType.SHAPE),
    shapeType: z.enum(['rect', 'circle', 'line']),
    fill: z.string(),
    stroke: z.string(),
    strokeWidth: z.number().min(0).transform(val => toCanonical(val)).default(0),
});

export const elementSchema = z.discriminatedUnion('type', [
    textElementSchema,
    imageElementSchema,
    shapeElementSchema,
]);

// --- STRUCTURE ---

export const slideSchema = z.object({
    id: z.string().uuid(),
    elements: z.array(elementSchema),
    order: z.number().int(),
    backgroundColor: z.string().default('#ffffff'),
    backgroundImage: z.string().optional(),
    backgroundFilters: filterConfigSchema.default({ // Defaults
        blur: 0, brightness: 0, contrast: 0, saturation: 0
    }),
});

export const projectSchema = z.object({
    id: z.string().uuid(),
    version: z.number().int().default(2), // V2
    title: z.string().min(1),
    slides: z.array(slideSchema),
    createdAt: z.number(),
    updatedAt: z.number(),
    aspectRatio: z.nativeEnum(AspectRatio).default(AspectRatio.RATIO_1_1),
    theme: z.string().default('default'),
});

// --- EXPORTS ---

export type ProjectSchema = z.infer<typeof projectSchema>;
export type SlideSchema = z.infer<typeof slideSchema>;
export type ElementSchema = z.infer<typeof elementSchema>;
