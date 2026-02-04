import { Template, ElementType, AspectRatio } from '@/models/types';

export const BASE_TEMPLATES: Template[] = [
    // 1. TITLE
    {
        id: 'TITLE',
        name: 'Hero / Title',
        version: 1,
        aspectRatio: AspectRatio.RATIO_1_1,
        backgroundElements: [],
        slots: [
            {
                id: 'heading',
                type: ElementType.TEXT,
                rect: { x: 100, y: 300, width: 880, height: 300 },
                constraints: { charLimit: 80 }
            },
            {
                id: 'subheading',
                type: ElementType.TEXT,
                rect: { x: 100, y: 650, width: 880, height: 150 },
                constraints: { charLimit: 120 }
            }
        ]
    },
    // 2. CONTENT
    {
        id: 'CONTENT',
        name: 'Standard Content',
        version: 1,
        aspectRatio: AspectRatio.RATIO_1_1,
        backgroundElements: [],
        slots: [
            {
                id: 'heading',
                type: ElementType.TEXT,
                rect: { x: 80, y: 100, width: 920, height: 150 },
                constraints: { charLimit: 60 }
            },
            {
                id: 'body',
                type: ElementType.TEXT,
                rect: { x: 80, y: 300, width: 920, height: 600 },
                constraints: { charLimit: 500 }
            }
        ]
    },
    // 3. NUMBERED
    {
        id: 'NUMBERED',
        name: 'Numbered List',
        version: 1,
        aspectRatio: AspectRatio.RATIO_1_1,
        backgroundElements: [],
        slots: [
            {
                id: 'heading',
                type: ElementType.TEXT,
                rect: { x: 80, y: 100, width: 920, height: 150 },
                constraints: { charLimit: 60 }
            },
            {
                id: 'body',
                type: ElementType.TEXT,
                rect: { x: 120, y: 300, width: 880, height: 650 },
                constraints: { charLimit: 500 }
            }
        ]
    },
    // 4. COMPARISON
    {
        id: 'COMPARISON',
        name: 'Text Comparison',
        version: 1,
        aspectRatio: AspectRatio.RATIO_1_1,
        backgroundElements: [],
        slots: [
            {
                id: 'heading',
                type: ElementType.TEXT,
                rect: { x: 80, y: 100, width: 920, height: 120 },
                constraints: { charLimit: 60 }
            },
            {
                id: 'left_body',
                type: ElementType.TEXT,
                rect: { x: 80, y: 250, width: 440, height: 650 },
                constraints: { charLimit: 250 }
            },
            {
                id: 'right_body',
                type: ElementType.TEXT,
                rect: { x: 560, y: 250, width: 440, height: 650 },
                constraints: { charLimit: 250 }
            }
        ]
    },
    // 5. COMPARISON_IMAGE
    {
        id: 'COMPARISON_IMAGE',
        name: 'Side-by-side Images',
        version: 1,
        aspectRatio: AspectRatio.RATIO_1_1,
        backgroundElements: [],
        slots: [
            {
                id: 'heading',
                type: ElementType.TEXT,
                rect: { x: 80, y: 80, width: 920, height: 100 },
                constraints: { charLimit: 60 }
            },
            {
                id: 'left_image',
                type: ElementType.IMAGE,
                rect: { x: 80, y: 200, width: 440, height: 600 }
            },
            {
                id: 'right_image',
                type: ElementType.IMAGE,
                rect: { x: 560, y: 200, width: 440, height: 600 }
            }
        ]
    },
    // 6. IMAGE_ONLY
    {
        id: 'IMAGE_ONLY',
        name: 'Full Bleed Image',
        version: 1,
        aspectRatio: AspectRatio.RATIO_1_1,
        backgroundElements: [],
        slots: [
            {
                id: 'main_image',
                type: ElementType.IMAGE,
                rect: { x: 0, y: 0, width: 1080, height: 1080 }
            },
            {
                id: 'caption',
                type: ElementType.TEXT,
                rect: { x: 100, y: 850, width: 880, height: 150 },
                constraints: { charLimit: 100 }
            }
        ]
    },
    // 7. IMAGE_TEXT
    {
        id: 'IMAGE_TEXT',
        name: 'Image + Text',
        version: 1,
        aspectRatio: AspectRatio.RATIO_1_1,
        backgroundElements: [],
        slots: [
            {
                id: 'main_image',
                type: ElementType.IMAGE,
                rect: { x: 80, y: 150, width: 440, height: 780 }
            },
            {
                id: 'heading',
                type: ElementType.TEXT,
                rect: { x: 560, y: 150, width: 440, height: 200 }
            },
            {
                id: 'body',
                type: ElementType.TEXT,
                rect: { x: 560, y: 380, width: 440, height: 550 }
            }
        ]
    },
    // 8. HEADING
    {
        id: 'HEADING',
        name: 'Section Divider',
        version: 1,
        aspectRatio: AspectRatio.RATIO_1_1,
        backgroundElements: [],
        slots: [
            {
                id: 'heading',
                type: ElementType.TEXT,
                rect: { x: 140, y: 240, width: 800, height: 600 },
                constraints: { charLimit: 140 }
            }
        ]
    },
    // 9. CTA
    {
        id: 'CTA',
        name: 'Call to Action',
        version: 1,
        aspectRatio: AspectRatio.RATIO_1_1,
        backgroundElements: [],
        slots: [
            {
                id: 'heading',
                type: ElementType.TEXT,
                rect: { x: 100, y: 400, width: 880, height: 200 },
                constraints: { charLimit: 60 }
            },
            {
                id: 'subtext',
                type: ElementType.TEXT,
                rect: { x: 100, y: 650, width: 880, height: 100 },
                constraints: { charLimit: 100 }
            },
            {
                id: 'buttonText',
                type: ElementType.TEXT,
                rect: { x: 290, y: 800, width: 500, height: 120 },
                constraints: { charLimit: 30 }
            }
        ]
    }
];
