import { describe, it, expect } from 'vitest';
import { ResponseParser } from '../src/core/parser/responseParser';

describe('AI Layout Selection & Parsing', () => {

    it('should extract JSON from markdown blocks', () => {
        const raw = "Sure! Here is your carousel: \n```json\n{\n  \"title\": \"Parsing Test\",\n  \"slides\": [\n    { \"type\": \"TITLE\", \"heading\": \"Ready?\" }\n  ]\n}\n```\nHope you like it!";
        const result = ResponseParser.parse(raw);
        expect(result.title).toBe('Parsing Test');
        expect(result.slides[0].type).toBe('TITLE');
    });

    it('should handle raw JSON without blocks', () => {
        const raw = "{\"title\": \"Raw JSON\", \"slides\": [{\"type\": \"CONTENT\", \"heading\": \"Test\"}]}";
        const result = ResponseParser.parse(raw);
        expect(result.title).toBe('Raw JSON');
    });

    it('should assign TITLE to first slide by default if AI suggests it', () => {
        const raw = "{\"title\": \"T\", \"slides\": [{\"type\": \"TITLE\", \"heading\": \"H\"}]}";
        const result = ResponseParser.parse(raw);
        expect(result.slides[0].type).toBe('TITLE');
    });

    it('should respect character limits and truncate', () => {
        const longHeading = "A".repeat(200);
        const raw = `{"title": "T", "slides": [{"type": "TITLE", "heading": "${longHeading}"}]}`;
        const result = ResponseParser.parse(raw);
        expect(result.slides[0].heading?.length).toBeLessThanOrEqual(100);
    });

    it('should handle malformed JSON gracefully', () => {
        const raw = "```json\n{ broken: json";
        const result = ResponseParser.parse(raw);
        expect(result.title).toBe('Generation Failed');
        expect(result.slides[0].heading).toBe('Error Parsing AI');
    });

    it('should fix trailing commas', () => {
        const raw = '{"title": "Test", "slides": [{"type": "TITLE", "heading": "H"},]}';
        const result = ResponseParser.parse(raw);
        expect(result.title).toBe('Test');
    });

    it('should handle unescaped newlines in body text', () => {
        const raw = '{"title": "Test", "slides": [{"type": "CONTENT", "heading": "H", "body": "Line 1\nLine 2"}]}';
        const result = ResponseParser.parse(raw);
        expect(result.slides[0].body).toContain('Line 1');
    });

    it('should extract JSON even with leading/trailing text', () => {
        const raw = "Pre-amble { \"title\": \"Extraction\", \"slides\": [] } Post-amble";
        const result = ResponseParser.parse(raw);
        expect(result.title).toBe('Extraction');
    });
});
