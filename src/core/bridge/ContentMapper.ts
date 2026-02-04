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
        return 'CONTENT'; // default
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
                    let textValue = '';
                    let fontSize = 40;
                    let fontWeight: string | number = 400;
                    let fill = '#ffffff';

                    // Mapping logic per slot ID
                    switch (slot.id) {
                        case 'heading':
                            textValue = content.heading || '';
                            fontSize = 69; // User requirement
                            fontWeight = 800;
                            break;
                        case 'subheading':
                            textValue = content.subheading || '';
                            fontSize = 44;
                            fontWeight = 400;
                            fill = '#cbd5e1';
                            break;
                        case 'body':
                        case 'left_body':
                        case 'right_body':
                            textValue = content.body || '';
                            fontSize = 54; // User requirement
                            fontWeight = 400;
                            fill = '#94a3b8';
                            break;
                        case 'caption':
                            textValue = content.subheading || content.body || '';
                            fontSize = 28;
                            fill = '#ffffff';
                            break;
                        case 'buttonText':
                            textValue = content.buttonText || 'Learn More';
                            fontSize = 44;
                            fontWeight = 700;
                            fill = '#ffffff';
                            break;
                        case 'subtext':
                            textValue = content.subtext || '';
                            fontSize = 24;
                            fill = '#94a3b8';
                            break;
                    }

                    if (textValue) {
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
                            content: textValue,
                            fontSize,
                            fontFamily: 'Inter',
                            fontWait: fontWeight,
                            fill,
                            align: (templateId === 'TITLE' || templateId === 'CTA' || templateId === 'HEADING') ? 'center' : 'left',
                            verticalAlign: (templateId === 'TITLE' || templateId === 'HEADING') ? 'middle' : 'top',
                            lineHeight: 1.2,
                            autoWidth: false,
                            autoHeight: true
                        };
                        elements.push(textEl);
                    }
                } else if (slot.type === ElementType.IMAGE) {
                    // Placeholder Image
                    const imgEl: ImageElement = {
                        id: uuidv4(),
                        type: ElementType.IMAGE,
                        src: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60', // Abstract placeholder
                        x: slot.rect.x,
                        y: slot.rect.y,
                        width: slot.rect.width,
                        height: slot.rect.height,
                        rotation: 0,
                        opacity: 1,
                        locked: false,
                        zIndex: 5,
                        maintainAspectRatio: false, // Fill the slot
                        alt: content.imagePlaceholder || 'AI Placeholder'
                    };
                    elements.push(imgEl);
                }
            });

            // 3. Glassmorphism Logic
            let glassOverlay: GlassOverlay | undefined = undefined;
            if (content.hasGlassOverlay || templateId === 'IMAGE_TEXT' || templateId === 'IMAGE_ONLY') {
                glassOverlay = {
                    enabled: true,
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 16,
                    border: '1px solid rgba(255,255,255,0.1)',
                    padding: 24,
                    opacity: 1
                };
            }

            return {
                id: uuidv4(),
                order: index,
                backgroundColor: '#020617', // Modern Slate Dark
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
}
