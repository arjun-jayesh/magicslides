import { describe, test, expect } from 'vitest';
import { ResponseParser } from '../src/core/parser/responseParser';

describe('ResponseParser', () => {
    test('should parse clean JSON', () => {
        const input = '{"title": "Test", "slides": [{"type": "TITLE", "heading": "Hi"}]}';
        const result = ResponseParser.parse(input);
        expect(result.slides).toHaveLength(1);
        expect(result.title).toBe('Test');
    });

    test('should handle markdown wrappers', () => {
        const input = '```json\n{"title": "Test", "slides": [{"type": "TITLE", "heading": "Hi"}]}\n```';
        const result = ResponseParser.parse(input);
        expect(result.slides).toHaveLength(1);
    });

    test('should fix trailing commas', () => {
        const input = '{"title": "Test", "slides": [{"type": "TITLE", "heading": "Hi",},]}';
        const result = ResponseParser.parse(input);
        expect(result.slides).toHaveLength(1);
    });

    test('should fix unquoted keys', () => {
        const input = '{title: "Test", slides: [{type: "TITLE", heading: "Hi"}]}';
        const result = ResponseParser.parse(input);
        expect(result.title).toBe('Test');
        expect(result.slides).toHaveLength(1);
    });

    test('should repair incomplete JSON', () => {
        // Missing several closing braces
        const input = '{"title": "Repair Test", "slides": [{"type": "TITLE", "heading": "Incomplete"';
        const result = ResponseParser.parse(input);
        expect(result.title).toBe('Repair Test');
        expect(result.slides[0].heading).toBe('Incomplete');
    });

    test('should remove ellipsis placeholders', () => {
        const input = '{"title": "No Ellipsis", "slides": [{"type": "TITLE", "heading": "Hello"}, "..."]}';
        const result = ResponseParser.parse(input);
        expect(result.slides).toHaveLength(1);
    });

    test('should cleanup AI meta-comments', () => {
        const input = '{"title": "Meta Test", "slides": [{"type": "TITLE", "heading": "Slide 1"}, [Exactly 10 slides]]}';
        const result = ResponseParser.parse(input);
        expect(result.slides).toHaveLength(1);
    });

    test('should fallback gracefully on complete failure', () => {
        const input = 'Completely broken string with no json at all';
        const result = ResponseParser.parse(input);
        expect(result.slides).toHaveLength(1);
        expect(result.slides[0].heading).toBe('Generation Failed');
    });
});
