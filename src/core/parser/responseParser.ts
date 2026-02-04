export interface AIPayloadV2 {
    title: string;
    slides: {
        type: string;
        heading?: string;
        subheading?: string;
        body?: string;
        imagePlaceholder?: string;
        buttonText?: string;
        subtext?: string;
        hasGlassOverlay?: boolean;
        items?: string[];
    }[];
}

export class ResponseParser {
    static parse(raw: string): AIPayloadV2 {
        try {
            // Step 1: Strip markdown wrappers and whitespace
            let cleaned = ResponseParser.stripWrappers(raw);

            // Step 2: Fix common LLM JSON errors
            cleaned = ResponseParser.fixCommonErrors(cleaned);

            // Step 3: Parse with validation
            let data;
            try {
                data = JSON.parse(cleaned);
            } catch (e) {
                console.warn('Initial JSON Parse Failed, attempting aggressive repair:', e);
                // Step 4: Aggressive repair attempt
                const repaired = ResponseParser.repairJSON(cleaned);
                data = JSON.parse(repaired);
                console.warn('JSON repaired successfully');
            }

            // Step 5: Validate and Sanitize Structure
            return ResponseParser.validateAndSanitize(data);

        } catch (e) {
            console.error('JSON Parse Failed, using fallback heuristic', e);
            console.log('Raw AI Output:', raw);
            return ResponseParser.fallbackParse(raw);
        }
    }

    private static stripWrappers(raw: string): string {
        let cleaned = raw.trim();

        // Remove markdown code blocks
        cleaned = cleaned.replace(/^```json\s*/i, '');
        cleaned = cleaned.replace(/^```\s*/, '');
        cleaned = cleaned.replace(/```\s*$/, '');

        // Extract JSON object (handle cases with text before/after)
        const jsonMatch = cleaned.match(/({[\s\S]*})/);
        if (jsonMatch) {
            cleaned = jsonMatch[1];
        }

        return cleaned.trim();
    }

    private static fixCommonErrors(json: string): string {
        let fixed = json;

        // Fix 1: Remove trailing commas in arrays and objects
        fixed = fixed.replace(/,(\s*[\]}])/g, '$1');

        // Fix 2: Fix unquoted or single-quoted keys
        fixed = fixed.replace(/'([^']+)':/g, '"$1":');
        fixed = fixed.replace(/([{,]\s*)([a-zA-Z0-9_]+)(\s*:)/g, '$1"$2"$3');

        // Fix 3: Fix literal "\n" with actual newlines if JSON.parse will fail
        fixed = fixed.replace(/\\\\n/g, '\\n');

        // Fix 4: Remove ellipsis placeholders and meta-comments
        fixed = fixed.replace(/"\.\.\."/g, '""');
        fixed = fixed.replace(/\.\.\.+/g, '');
        fixed = fixed.replace(/\[Exactly \d+ slides?\]/gi, '');

        return fixed;
    }

    private static repairJSON(json: string): string {
        let repaired = json;

        // 1. Close unclosed string if it's the last token
        // Simple heuristic: if we have an odd number of non-escaped quotes
        const quotes = (repaired.match(/(?<!\\)"/g) || []).length;
        if (quotes % 2 !== 0) {
            repaired += '"';
        }

        // 2. Structural repair using a stack
        const stack: string[] = [];
        for (let i = 0; i < repaired.length; i++) {
            const char = repaired[i];
            if (char === '{') stack.push('}');
            else if (char === '[') stack.push(']');
            else if (char === '}' || char === ']') {
                if (stack.length > 0 && stack[stack.length - 1] === char) {
                    stack.pop();
                }
            }
        }

        // Close everything in the stack in LIFO order
        while (stack.length > 0) {
            repaired += stack.pop();
        }

        // 3. Final cleanup of commas
        repaired = repaired.replace(/,(\s*[\]}])/g, '$1');

        return repaired;
    }

    private static validateAndSanitize(data: any): AIPayloadV2 {
        if (!data || typeof data !== 'object') {
            throw new Error('Parsed data is not an object');
        }

        const payload: AIPayloadV2 = {
            title: (data.title || 'Untitled Project').substring(0, 100),
            slides: Array.isArray(data.slides) ? data.slides.map((s: any, idx: number) => {
                if (!s.type) {
                    console.warn(`Slide ${idx} missing type, defaulting to CONTENT`);
                    s.type = 'CONTENT';
                }
                return {
                    type: s.type || 'CONTENT',
                    heading: (s.heading || s.headline || '').substring(0, 100),
                    subheading: (s.subheading || '').substring(0, 150),
                    body: (s.body || '').substring(0, 300),
                    imagePlaceholder: s.imagePlaceholder || '',
                    buttonText: s.buttonText || '',
                    subtext: s.subtext || '',
                    hasGlassOverlay: !!s.hasGlassOverlay,
                    items: Array.isArray(s.items) ? s.items.map((it: any) => String(it)) : undefined
                };
            }) : []
        };

        if (payload.slides.length === 0) {
            throw new Error('Empty slides array');
        }

        return payload;
    }

    private static fallbackParse(raw: string): AIPayloadV2 {
        console.warn('Using heuristic parser fallback');
        const lines = raw.split('\n').filter(l => l.trim());
        const slides: any[] = [];
        let currentSlide: any = { type: 'CONTENT' };

        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.includes('heading')) {
                const match = trimmed.match(/"([^"]+)"/) || trimmed.match(/:\s*(.+)/);
                if (match) currentSlide.heading = match[1].replace(/[",]/g, '');
            }
            if (trimmed.includes('body')) {
                const match = trimmed.match(/"([^"]+)"/) || trimmed.match(/:\s*(.+)/);
                if (match) {
                    currentSlide.body = match[1].replace(/[",]/g, '');
                    slides.push({ ...currentSlide });
                    currentSlide = { type: 'CONTENT' };
                }
            }
        }

        if (slides.length === 0) {
            slides.push({
                type: 'TITLE',
                heading: 'Generation Failed',
                body: 'The AI returned an invalid format. Please try again.'
            });
        }

        return {
            title: 'Untitled Project',
            slides
        };
    }
}
