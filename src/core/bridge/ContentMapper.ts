import { Project, Slide, ElementType, TextElement, AspectRatio } from '@/models/types';
import { AIPayloadV2 } from '../parser/responseParser';
import { BASE_TEMPLATES } from '@/features/templates/registry';
import { v4 as uuidv4 } from 'uuid';

export class ContentMapper {
    static createProjectFromAI(payload: AIPayloadV2): Project {
        const slides: Slide[] = payload.slides.map((content, index) => {
            // 1. Select Template
            let templateId = 'tpl_content'; // Default
            if (index === 0) templateId = 'tpl_hero';
            else if (content.body.length < 50 && content.body.length > 0) templateId = 'tpl_quote'; // Short body = Quote? or just empty body? 
            // Better heuristic:
            // Hero: Index 0
            // Quote: Body < 60 chars OR Headline longer than Body (if body exists)
            // Content: Default

            const template = BASE_TEMPLATES.find(t => t.id === templateId) || BASE_TEMPLATES[0];

            const elements = template.backgroundElements.map(e => ({ ...e, id: uuidv4() }));

            // 2. Map Slots
            // We map 'headline' -> 'headline' slot
            // We map 'body' -> 'body' or 'subhead' slot

            // Headline
            if (content.headline) {
                const slot = template.slots.find(s => s.id === 'headline');
                if (slot) {
                    const textEl: TextElement = {
                        id: uuidv4(),
                        type: ElementType.TEXT,
                        x: slot.rect.x,
                        y: slot.rect.y,
                        width: slot.rect.width,
                        height: slot.rect.height,
                        rotation: 0,
                        opacity: 1,
                        locked: false, // User can move it
                        zIndex: 10,
                        content: content.headline,
                        fontSize: templateId === 'tpl_hero' ? 80 : 56,
                        fontFamily: 'Inter',
                        fontWait: 800,
                        fill: '#ffffff',
                        align: templateId === 'tpl_quote' ? 'center' : 'left',
                        verticalAlign: templateId === 'tpl_quote' ? 'middle' : 'top',
                        lineHeight: 1.1,
                        autoWidth: false,
                        autoHeight: true
                    };
                    elements.push(textEl);
                }
            }

            // Body
            if (content.body) {
                // Try 'body' slot first, then 'subhead' (for hero)
                let slot = template.slots.find(s => s.id === 'body');
                if (!slot) slot = template.slots.find(s => s.id === 'subhead');

                // If quote template and we have body, maybe append to headline or ignore?
                // If Quote template has no body slot.

                if (slot) {
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
                        content: content.body,
                        fontSize: templateId === 'tpl_hero' ? 36 : 32,
                        fontFamily: 'Inter',
                        fontWait: 400,
                        fill: '#cccccc', // Muted text
                        align: 'left',
                        verticalAlign: 'top',
                        lineHeight: 1.5,
                        autoWidth: false,
                        autoHeight: true
                    };
                    elements.push(textEl);
                }
            }

            return {
                id: uuidv4(),
                order: index,
                backgroundColor: '#000000', // Default dark
                backgroundFilters: { blur: 0, brightness: 0, contrast: 0, saturation: 0 },
                elements
            };
        });

        // 3. Append CTA Slide if CTA exists
        if (payload.cta) {
            const ctaTemplate = BASE_TEMPLATES.find(t => t.id === 'tpl_end')!;
            const ctaElements = ctaTemplate.backgroundElements.map(e => ({ ...e, id: uuidv4() }));

            // Map 'headline' -> 'Thanks'
            // Map 'cta' -> payload.cta

            // Headline (Generic "Thanks")
            const headSlot = ctaTemplate.slots.find(s => s.id === 'headline');
            if (headSlot) {
                ctaElements.push({
                    id: uuidv4(),
                    type: ElementType.TEXT,
                    x: headSlot.rect.x,
                    y: headSlot.rect.y,
                    width: headSlot.rect.width,
                    height: headSlot.rect.height,
                    rotation: 0,
                    opacity: 1,
                    locked: false,
                    zIndex: 10,
                    content: "Thanks for reading!",
                    fontSize: 64,
                    fontFamily: 'Inter',
                    fontWait: 800,
                    fill: '#ffffff',
                    align: 'center',
                    verticalAlign: 'middle',
                    lineHeight: 1.1,
                    autoWidth: false,
                    autoHeight: true
                } as TextElement);
            }

            // CTA Text
            const ctaSlot = ctaTemplate.slots.find(s => s.id === 'cta');
            if (ctaSlot) {
                ctaElements.push({
                    id: uuidv4(),
                    type: ElementType.TEXT,
                    x: ctaSlot.rect.x,
                    y: ctaSlot.rect.y,
                    width: ctaSlot.rect.width,
                    height: ctaSlot.rect.height,
                    rotation: 0,
                    opacity: 1,
                    locked: false,
                    zIndex: 10,
                    content: payload.cta,
                    fontSize: 48,
                    fontFamily: 'Inter',
                    fontWait: 600,
                    fill: '#3B82F6', // Blue CTA
                    align: 'center',
                    verticalAlign: 'top',
                    lineHeight: 1.2,
                    autoWidth: false,
                    autoHeight: true
                } as TextElement);
            }

            slides.push({
                id: uuidv4(),
                order: slides.length,
                backgroundColor: '#000000',
                backgroundFilters: { blur: 0, brightness: 0, contrast: 0, saturation: 0 },
                elements: ctaElements
            });
        }

        return {
            id: uuidv4(),
            version: 2,
            title: payload.title,
            slides,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            aspectRatio: AspectRatio.RATIO_1_1, // Default
            theme: 'default'
        };
    }
}
