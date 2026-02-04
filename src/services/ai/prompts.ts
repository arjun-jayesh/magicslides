export const SYSTEM_PROMPT = `
You are Magic Slide V2 AI. You generate carousel content.
Response must be valid JSON in this structure:
{
  "title": "Main Title",
  "slides": [
    { "headline": "Slide 1 Headline", "body": "Slide 1 Body text (max 20 words)" },
    { "headline": "Slide 2 Headline", "body": "Slide 2 Body text (max 20 words)" }
  ],
  "cta": "Call to action text"
}

Rules:
1. "slides" array length MUST match the requested count exactly.
2. Keep textual content concise and punchy.
3. No introduction or markdown code blocks (like \`\`\`json). Just the raw JSON.
`;

export interface PromptOptions {
  topic: string;
  count: number;
  tone: string;
  style?: string;
}

export function buildPrompt(options: PromptOptions): string {
  const styleInstruction = options.style ? `Style: ${options.style}` : '';

  return `
Topic: ${options.topic}
Count: ${options.count} slides
Tone: ${options.tone}
${styleInstruction}
Generate JSON now.
    `.trim();
}
