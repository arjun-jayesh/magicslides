import { Slide, Slot, TextElement, ElementType } from '@/models/types';
import { measureText } from '@/features/fonts/textMetrics';

export class TemplateEngine {
    static validateStart(slide: Slide, templateSlots: Slot[]): boolean {
        // Check if slide elements are valid for the slots?
        return !!slide && !!templateSlots; // Use them
    }

    /**
     * Checks if valid text fits in the slot.
     */
    static checkConstraint(text: string, slot: Slot, style: Partial<TextElement>): { valid: boolean; reason?: string } {
        if (slot.type !== ElementType.TEXT) return { valid: true };

        // 1. Char limit
        if (slot.constraints?.charLimit && text.length > slot.constraints.charLimit) {
            return { valid: false, reason: 'Character limit exceeded' };
        }

        // 2. Visual overflow
        const metrics = measureText({
            text,
            fontSize: style.fontSize || 16,
            fontFamily: style.fontFamily || 'Arial',
            fontWeight: style.fontWait || 400,
            lineHeight: style.lineHeight || 1.5
        });

        if (metrics.width > slot.rect.width) {
            // Width check
        }

        if (metrics.height > slot.rect.height) {
            return { valid: false, reason: 'Vertical overflow' };
        }

        return { valid: true };
    }
}
