export interface AIPayloadV2 {
    title: string;
    slides: {
        type: string;
        heading?: string;
        subheading?: string;
        body?: string;
        leftContent?: string;
        rightContent?: string;
        imagePlaceholder?: string;
        buttonText?: string;
        subtext?: string;
        hasGlassOverlay?: boolean;
        items?: string[];
    }[];
}

export class ResponseParser {
    private static readonly VALID_TYPES = [
        'TITLE', 'CONTENT', 'NUMBERED', 'COMPARISON',
        'COMPARISON_IMAGE', 'IMAGE_ONLY', 'IMAGE_TEXT', 'HEADING', 'CTA'
    ];

    static parse(raw: string): AIPayloadV2 {
        try {
            // Step 1: Strip markdown wrappers
            let cleaned = ResponseParser.stripWrappers(raw);

            // Step 2: Fix common LLM JSON errors
            cleaned = ResponseParser.fixCommonErrors(cleaned);

            // Step 3: Parse with validation
            let data;
            try {
                data = JSON.parse(cleaned);
            } catch (e) {
                console.warn('Initial JSON Parse Failed, attempting aggressive repair:', e);
                const repaired = ResponseParser.repairJSON(cleaned);
                data = JSON.parse(repaired);
                console.warn('✅ JSON repaired successfully');
            }

            // Step 4: Validate and Sanitize Structure
            const validated = ResponseParser.validateAndSanitize(data);

            // Step 5: CRITICAL - Enforce Slide Ordering & Diversity
            const enforced = ResponseParser.enforceSlideRules(validated);

            return enforced;

        } catch (e) {
            console.error('❌ JSON Parse Failed, using fallback heuristic', e);
            console.log('📄 Raw AI Output:', raw);
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

        // Fix 3: Handle literal newlines (Only if they break the JSON structure)
        // Note: Global replacement of \n with \\n breaks structural JSON.
        // We'll let the aggressive repair or fallback handle truly broken strings.
        fixed = fixed.replace(/\\\\n/g, '\\n');

        // Fix 4: Remove ellipsis placeholders
        fixed = fixed.replace(/"\.\.\."/g, '""');
        fixed = fixed.replace(/\.\.\.+/g, '');
        fixed = fixed.replace(/\[Exactly \d+ slides?\]/gi, '');
        fixed = fixed.replace(/\[IMAGE:?\s*\]/gi, '');

        // Fix 5: Remove comments (// or /* */)
        fixed = fixed.replace(/\/\/.*$/gm, '');
        fixed = fixed.replace(/\/\*[\s\S]*?\*\//g, '');

        return fixed;
    }

    private static repairJSON(json: string): string {
        let repaired = json;

        // 1. Close unclosed strings
        const quotes = (repaired.match(/(?<!\\)"/g) || []).length;
        if (quotes % 2 !== 0) {
            repaired += '"';
        }

        // 2. Structural repair using stack
        const stack: string[] = [];
        let inString = false;

        for (let i = 0; i < repaired.length; i++) {
            const char = repaired[i];
            const prevChar = i > 0 ? repaired[i - 1] : '';

            // Track string boundaries
            if (char === '"' && prevChar !== '\\') {
                inString = !inString;
            }

            if (!inString) {
                if (char === '{') stack.push('}');
                else if (char === '[') stack.push(']');
                else if (char === '}' || char === ']') {
                    if (stack.length > 0 && stack[stack.length - 1] === char) {
                        stack.pop();
                    }
                }
            }
        }

        // Close everything in LIFO order
        while (stack.length > 0) {
            repaired += stack.pop();
        }

        // 3. Final cleanup
        repaired = repaired.replace(/,(\s*[\]}])/g, '$1');

        return repaired;
    }

    private static validateAndSanitize(data: any): AIPayloadV2 {
        if (!data || typeof data !== 'object') {
            throw new Error('Parsed data is not an object');
        }

        const payload: AIPayloadV2 = {
            title: (data.title || 'Untitled Project').substring(0, 80).trim(),
            slides: Array.isArray(data.slides) ? data.slides.map((s: any, idx: number) => {
                // Normalize type
                let type = String(s.type || 'CONTENT').toUpperCase().trim();
                if (!ResponseParser.VALID_TYPES.includes(type)) {
                    console.warn(`⚠️ Invalid slide type "${type}" at index ${idx}, defaulting to CONTENT`);
                    type = 'CONTENT';
                }

                // Enforce mandatory fields per type
                const heading = (s.heading || s.headline || '').substring(0, 60).trim();
                const subheading = (s.subheading || '').substring(0, 80).trim();
                let body = (s.body || '').substring(0, 200).trim();
                let leftContent = (s.leftContent || '').substring(0, 200).trim();
                let rightContent = (s.rightContent || '').substring(0, 200).trim();

                // CRITICAL FIX: Smart content fallback
                if (type === 'CONTENT' && !body && subheading) {
                    body = subheading;
                    // subheading = ''; // Don't clear, let it stay for diversity
                }

                // CRITICAL FIX: Comparison content splitting
                if (type === 'COMPARISON') {
                    if (!leftContent || !rightContent) {
                        if (body) {
                            // Attempt to split by common separators
                            const separators = [' vs ', ' vs. ', ' versus ', '|', ' - ', ': '];
                            let split = false;

                            for (const sep of separators) {
                                if (body.toLowerCase().includes(sep.toLowerCase())) {
                                    const parts = body.split(new RegExp(sep, 'i'));
                                    if (parts.length >= 2) {
                                        leftContent = parts[0].trim();
                                        rightContent = parts.slice(1).join(' ').trim();
                                        split = true;
                                        break;
                                    }
                                }
                            }

                            // If no split, duplicate to both sides (last resort)
                            if (!split) {
                                leftContent = body;
                                rightContent = body + ' (comparison needed)';
                            }
                        } else {
                            // No content at all - provide defaults
                            leftContent = heading ? `${heading} - Option A` : 'Option A';
                            rightContent = heading ? `${heading} - Option B` : 'Option B';
                        }
                    }
                }

                // CRITICAL FIX: Numbered items validation
                let items = Array.isArray(s.items)
                    ? s.items.filter((it: any) => String(it).trim()).map((it: any) => String(it).trim().substring(0, 150))
                    : undefined;

                if (type === 'NUMBERED' && (!items || items.length === 0)) {
                    // Generate from body if available
                    if (body) {
                        items = body.split(/[.;]/).filter((segment: string) => segment.trim()).slice(0, 5);
                    } else {
                        items = [`${heading || 'Point'} - Detail 1`, `${heading || 'Point'} - Detail 2`];
                    }
                }

                return {
                    type,
                    heading: heading || `Slide ${idx + 1}`,
                    subheading,
                    body,
                    leftContent,
                    rightContent,
                    imagePlaceholder: (s.imagePlaceholder || '').substring(0, 100).trim(),
                    buttonText: (s.buttonText || (type === 'CTA' ? 'Learn More' : '')).substring(0, 30).trim(),
                    subtext: (s.subtext || '').substring(0, 100).trim(),
                    hasGlassOverlay: !!s.hasGlassOverlay || type === 'IMAGE_TEXT' || type === 'IMAGE_ONLY',
                    items
                };
            }) : []
        };

        if (payload.slides.length === 0) {
            throw new Error('Empty slides array');
        }

        return payload;
    }

    private static enforceSlideRules(payload: AIPayloadV2): AIPayloadV2 {
        const slides = payload.slides;

        // Rule 1: First slide MUST be TITLE
        if (slides[0].type !== 'TITLE') {
            console.warn('⚠️ First slide is not TITLE, converting...');
            slides[0].type = 'TITLE';
            if (!slides[0].subheading && slides[0].body) {
                slides[0].subheading = slides[0].body.substring(0, 80);
            }
        }

        // Rule 2: Last slide MUST be CTA
        if (slides[slides.length - 1].type !== 'CTA') {
            console.warn('⚠️ Last slide is not CTA, converting...');
            const lastSlide = slides[slides.length - 1];
            lastSlide.type = 'CTA';
            if (!lastSlide.buttonText) {
                lastSlide.buttonText = 'Get Started';
            }
            if (!lastSlide.subtext) {
                lastSlide.subtext = 'Click to learn more';
            }
        }

        // Rule 3: No CTA or TITLE in the middle
        for (let i = 1; i < slides.length - 1; i++) {
            if (slides[i].type === 'CTA' || slides[i].type === 'TITLE') {
                console.warn(`⚠️ Found ${slides[i].type} at position ${i}, converting to CONTENT`);
                slides[i].type = 'CONTENT';
            }
        }

        // Rule 4: Ensure content diversity (no more than 3 consecutive same types)
        let consecutiveCount = 1;
        let lastType = slides[1]?.type;

        for (let i = 2; i < slides.length - 1; i++) {
            if (slides[i].type === lastType) {
                consecutiveCount++;
                if (consecutiveCount > 3) {
                    console.warn(`⚠️ Too many consecutive ${lastType} slides, converting slide ${i} to HEADING`);
                    slides[i].type = 'HEADING';
                    consecutiveCount = 1;
                    lastType = 'HEADING';
                }
            } else {
                consecutiveCount = 1;
                lastType = slides[i].type;
            }
        }

        return payload;
    }

    private static fallbackParse(raw: string): AIPayloadV2 {
        console.warn('🔄 Using enhanced heuristic parser fallback');

        // Try to extract any structured data
        const slides: any[] = [];

        // Split by common delimiters
        const sections = raw.split(/(?:slide|chapter|section)\s*\d+/i);

        for (let i = 0; i < sections.length; i++) {
            const section = sections[i].trim();
            if (!section) continue;

            const slide: any = {
                type: i === 0 ? 'TITLE' : (i === sections.length - 1 ? 'CTA' : 'CONTENT'),
                heading: '',
                body: ''
            };

            // Extract heading (first line or quoted text)
            const lines = section.split('\n').filter(l => l.trim());
            if (lines.length > 0) {
                slide.heading = lines[0].replace(/[#*"']/g, '').trim().substring(0, 60);
            }

            // Extract body (remaining lines)
            if (lines.length > 1) {
                slide.body = lines.slice(1).join(' ').replace(/[*"']/g, '').trim().substring(0, 200);
            }

            if (slide.heading || slide.body) {
                slides.push(slide);
            }
        }

        // Ensure at least 2 slides
        if (slides.length === 0) {
            slides.push({
                type: 'TITLE',
                heading: 'Generation Failed',
                subheading: 'The AI returned invalid format'
            });
        }

        if (slides.length === 1) {
            slides.push({
                type: 'CTA',
                heading: 'Try Again',
                buttonText: 'Regenerate',
                subtext: 'Click to create new slides'
            });
        }

        return {
            title: slides[0]?.heading || 'Untitled Project',
            slides
        };
    }
}
