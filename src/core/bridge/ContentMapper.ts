import { Project, Slide, ElementType, TextElement, ImageElement, AspectRatio, SlideLayoutType, CanvasElement, GlassOverlay } from '@/models/types';
import { AIPayloadV2 } from '../parser/responseParser';
import { BASE_TEMPLATES } from '@/features/templates/registry';
import { v4 as uuidv4 } from 'uuid';

export class ContentMapper {
    static inferLayoutType(slide: Slide): string {
        if (slide.elements.length === 1 && slide.elements[0].type === ElementType.TEXT) {
            const fontEl = slide.elements[0] as TextElement;
            return fontEl.fontSize > 40 ? 'TITLE' : 'HEADING';
        }
        if (slide.elements.some(el => el.type === ElementType.IMAGE)) {
            return 'IMAGE_TEXT';
        }
        return 'CONTENT';
    }

    static createProjectFromAI(payload: AIPayloadV2): Project {
        const slides: Slide[] = payload.slides.map((content, index) => {
            // 1. Select Template based on AI type hint
            const templateId = content.type.toUpperCase();
            const template = BASE_TEMPLATES.find(t => t.id === templateId) || BASE_TEMPLATES.find(t => t.id === 'CONTENT')!;

            const elements: CanvasElement[] = [...template.backgroundElements.map(e => ({ ...e, id: uuidv4() }))];

            // 2. Map Slots to Content
            template.slots.forEach(slot => {
                if (slot.type === ElementType.TEXT) {
                    const textConfig = ContentMapper.getTextConfig(slot.id, content, templateId);

                    if (textConfig.value) {
                        const textEl: TextElement = {
                            id: uuidv4(),
                            type: ElementType.TEXT,
                            x: slot.rect.x,
                            y: slot.rect.y,
                            width: slot.rect.width,
                            height: slot.rect.height,
                            rotation: 0,
                            opacity: 1,
                            locked: false,
                            zIndex: 10,
                            content: textConfig.value,
                            fontSize: textConfig.fontSize,
                            fontFamily: 'Inter',
                            fontWeight: textConfig.fontWeight, // FIXED TYPO
                            fill: textConfig.fill,
                            align: textConfig.align,
                            verticalAlign: textConfig.verticalAlign,
                            lineHeight: 1.2,
                            autoWidth: false,
                            autoHeight: true
                        };
                        elements.push(textEl);
                    }
                } else if (slot.type === ElementType.IMAGE) {
                    const imgEl: ImageElement = {
                        id: uuidv4(),
                        type: ElementType.IMAGE,
                        src: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60',
                        x: slot.rect.x,
                        y: slot.rect.y,
                        width: slot.rect.width,
                        height: slot.rect.height,
                        rotation: 0,
                        opacity: 1,
                        locked: false,
                        zIndex: 5,
                        maintainAspectRatio: false,
                        alt: content.imagePlaceholder || 'AI Placeholder Image'
                    };
                    elements.push(imgEl);
                }
            });

            // 3. Handle NUMBERED type specially (add bullet list)
            if (content.type === 'NUMBERED' && content.items && content.items.length > 0) {
                const bulletText = content.items.map((item, idx) => `${idx + 1}. ${item}`).join('\n');
                const bulletEl: TextElement = {
                    id: uuidv4(),
                    type: ElementType.TEXT,
                    x: 100,
                    y: 400,
                    width: 880,
                    height: 500,
                    rotation: 0,
                    opacity: 1,
                    locked: false,
                    zIndex: 11,
                    content: bulletText,
                    fontSize: 44,
                    fontFamily: 'Inter',
                    fontWeight: 400,
                    fill: '#e2e8f0',
                    align: 'left',
                    verticalAlign: 'top',
                    lineHeight: 1.5,
                    autoWidth: false,
                    autoHeight: true
                };
                elements.push(bulletEl);
            }

            // 4. Glassmorphism Logic
            let glassOverlay: GlassOverlay | undefined = undefined;
            if (content.hasGlassOverlay) {
                glassOverlay = {
                    enabled: true,
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    backdropFilter: 'blur(12px)',
                    borderRadius: 20,
                    border: '1px solid rgba(255,255,255,0.12)',
                    padding: 32,
                    opacity: 1
                };
            }

            return {
                id: uuidv4(),
                order: index,
                backgroundColor: '#0f172a', // Slate 900
                backgroundFilters: { blur: 0, brightness: 0, contrast: 0, saturation: 0 },
                elements,
                layoutType: templateId as SlideLayoutType,
                glassOverlay
            };
        });

        return {
            id: uuidv4(),
            version: 2,
            title: payload.title,
            slides,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            aspectRatio: AspectRatio.RATIO_1_1,
            theme: 'preset_modern'
        };
    }

    private static getTextConfig(slotId: string, content: any, templateId: string): any {
        const isCentered = ['TITLE', 'CTA', 'HEADING'].includes(templateId);

        const configs: Record<string, any> = {
            heading: {
                value: content.heading || '',
                fontSize: 69,
                fontWeight: 800,
                fill: '#ffffff',
                align: isCentered ? 'center' : 'left',
                verticalAlign: isCentered ? 'middle' : 'top'
            },
            subheading: {
                value: content.subheading || '',
                fontSize: 44,
                fontWeight: 400,
                fill: '#cbd5e1',
                align: isCentered ? 'center' : 'left',
                verticalAlign: 'top'
            },
            body: {
                value: content.body || '',
                fontSize: 54,
                fontWeight: 400,
                fill: '#94a3b8',
                align: 'left',
                verticalAlign: 'top'
            },
            left_body: {
                value: content.leftContent || content.body || '',
                fontSize: 48,
                fontWeight: 400,
                fill: '#94a3b8',
                align: 'left',
                verticalAlign: 'top'
            },
            right_body: {
                value: content.rightContent || '',
                fontSize: 48,
                fontWeight: 400,
                fill: '#94a3b8',
                align: 'left',
                verticalAlign: 'top'
            },
            caption: {
                value: content.subheading || content.body || '',
                fontSize: 32,
                fontWeight: 400,
                fill: '#ffffff',
                align: 'center',
                verticalAlign: 'top'
            },
            buttonText: {
                value: content.buttonText || 'Learn More',
                fontSize: 44,
                fontWeight: 700,
                fill: '#ffffff',
                align: 'center',
                verticalAlign: 'middle'
            },
            subtext: {
                value: content.subtext || '',
                fontSize: 28,
                fontWeight: 400,
                fill: '#94a3b8',
                align: 'center',
                verticalAlign: 'top'
            }
        };

        return configs[slotId] || {
            value: '',
            fontSize: 40,
            fontWeight: 400,
            fill: '#ffffff',
            align: 'left',
            verticalAlign: 'top'
        };
    }
}
