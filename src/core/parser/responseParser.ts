export interface ParsedBlock {
    type: 'TITLE' | 'SLIDE' | 'CTA';
    index?: number;
    content: string[]; // Lines or sentences
}

export interface AIPayloadV2 {
    title: string;
    slides: {
        headline: string;
        body: string;
    }[];
    cta: string;
}

export class ResponseParser {
    static parse(raw: string): AIPayloadV2 {
        try {
            // 1. Try Clean Parse
            // Detect if wrapped in code blocks
            let clean = raw.trim();
            if (clean.startsWith('```json')) {
                clean = clean.replace(/^```json/, '').replace(/```$/, '');
            } else if (clean.startsWith('```')) {
                clean = clean.replace(/^```/, '').replace(/```$/, '');
            }

            clean = clean.trim();
            const data = JSON.parse(clean);

            // Validation / Sanitization
            return {
                title: data.title || 'Untitled Project',
                slides: Array.isArray(data.slides) ? data.slides.map((s: any) => ({
                    headline: s.headline || '',
                    body: s.body || ''
                })) : [],
                cta: data.cta || 'Thanks for reading'
            };

        } catch (e) {
            console.error("JSON Parse Failed, falling back to heuristic", e);
            console.log("Raw AI Output:", raw);

            // Fallback: Return a single error slide so user knows
            return {
                title: 'Generation Failed',
                slides: [{ headline: 'Error Parsing AI', body: 'The AI returned invalid format. Please try again.' }],
                cta: 'Retry'
            };
        }
    }
}
