import { Template, ElementType, AspectRatio } from '@/models/types';
import { v4 as uuidv4 } from 'uuid';

export const BASE_TEMPLATES: Template[] = [
    // 1. HERO SLIDE
    {
        id: 'tpl_hero',
        name: 'Hero / Title',
        version: 1,
        aspectRatio: AspectRatio.RATIO_1_1,
        backgroundElements: [],
        slots: [
            {
                id: 'headline',
                type: ElementType.TEXT,
                rect: { x: 100, y: 300, width: 880, height: 300 }, // Center-ish
                constraints: { charLimit: 80 }
            },
            {
                id: 'subhead',
                type: ElementType.TEXT,
                rect: { x: 100, y: 650, width: 880, height: 150 },
                constraints: { charLimit: 120 }
            }
        ]
    },
    // 2. CONTENT / LIST SLIDE
    {
        id: 'tpl_content',
        name: 'Content List',
        version: 1,
        aspectRatio: AspectRatio.RATIO_1_1,
        backgroundElements: [],
        slots: [
            {
                id: 'headline',
                type: ElementType.TEXT,
                rect: { x: 80, y: 100, width: 920, height: 150 }, // Top header
                constraints: { charLimit: 60 }
            },
            {
                id: 'body',
                type: ElementType.TEXT,
                rect: { x: 80, y: 300, width: 920, height: 600 }, // Main body
                constraints: { charLimit: 500 }
            }
        ]
    },
    // 3. QUOTE / IMPACT SLIDE
    {
        id: 'tpl_quote',
        name: 'Quote / Impact',
        version: 1,
        aspectRatio: AspectRatio.RATIO_1_1,
        backgroundElements: [],
        slots: [
            {
                id: 'headline',
                type: ElementType.TEXT,
                rect: { x: 140, y: 240, width: 800, height: 600 }, // Big center text
                constraints: { charLimit: 140 }
            }
        ]
    },
    // 4. END / CTA SLIDE
    {
        id: 'tpl_end',
        name: 'End / CTA',
        version: 1,
        aspectRatio: AspectRatio.RATIO_1_1,
        backgroundElements: [
            {
                id: uuidv4(),
                type: ElementType.SHAPE, // Arrow or icon placeholder?
                shapeType: 'circle',
                x: 440, y: 200, width: 200, height: 200,
                fill: '#3B82F6', stroke: '', strokeWidth: 0,
                rotation: 0, opacity: 1, locked: true, zIndex: 0
            }
        ],
        slots: [
            {
                id: 'headline',
                type: ElementType.TEXT,
                rect: { x: 100, y: 500, width: 880, height: 200 }, // "Thanks for reading!"
                constraints: { charLimit: 60 }
            },
            {
                id: 'cta',
                type: ElementType.TEXT,
                rect: { x: 100, y: 750, width: 880, height: 150 }, // "Follow for more"
                constraints: { charLimit: 100 }
            }
        ]
    }
];
