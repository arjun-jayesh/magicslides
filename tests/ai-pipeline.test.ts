// test/ai-pipeline.test.ts
import { describe, test, expect } from 'vitest';
import { ResponseParser } from '../src/core/parser/responseParser';
import { ContentMapper } from '../src/core/bridge/ContentMapper';

describe('AI Pipeline Integration', () => {
    test('should handle perfect JSON', () => {
        const input = `{"title":"Test","slides":[{"type":"TITLE","heading":"Hi"},{"type":"CTA","heading":"End","buttonText":"Click"}]}`;
        const parsed = ResponseParser.parse(input);
        expect(parsed.slides).toHaveLength(2);
        expect(parsed.slides[0].type).toBe('TITLE');
        expect(parsed.slides[1].type).toBe('CTA');
    });

    test('should fix trailing commas', () => {
        const input = `{"title":"Test","slides":[{"type":"TITLE","heading":"Hi",},]}`;
        const parsed = ResponseParser.parse(input);
        expect(parsed.slides).toHaveLength(1);
    });

    test('should enforce TITLE as first slide', () => {
        const input = `{"title":"Test","slides":[{"type":"CONTENT","heading":"Hi","body":"Text"},{"type":"CTA","heading":"End","buttonText":"Go"}]}`;
        const parsed = ResponseParser.parse(input);
        expect(parsed.slides[0].type).toBe('TITLE'); // Auto-converted
    });

    test('should enforce CTA as last slide', () => {
        const input = `{"title":"Test","slides":[{"type":"TITLE","heading":"Hi"},{"type":"CONTENT","heading":"Mid","body":"Text"}]}`;
        const parsed = ResponseParser.parse(input);
        expect(parsed.slides[parsed.slides.length - 1].type).toBe('CTA'); // Auto-converted
    });

    test('should split COMPARISON content', () => {
        const input = `{"title":"Test","slides":[{"type":"TITLE","heading":"Hi"},{"type":"COMPARISON","heading":"A vs B","body":"Option A vs Option B"},{"type":"CTA","heading":"End","buttonText":"Go"}]}`;
        const parsed = ResponseParser.parse(input);
        expect(parsed.slides[1].leftContent).toContain('Option A');
        expect(parsed.slides[1].rightContent).toContain('Option B');
    });

    test('should generate items for NUMBERED if missing', () => {
        const input = `{"title":"Test","slides":[{"type":"TITLE","heading":"Hi"},{"type":"NUMBERED","heading":"Steps","body":"Step 1. First. Step 2. Second"},{"type":"CTA","heading":"End","buttonText":"Go"}]}`;
        const parsed = ResponseParser.parse(input);
        expect(parsed.slides[1].items).toBeDefined();
        expect(parsed.slides[1].items!.length).toBeGreaterThan(0);
    });

    test('should map to Project correctly', () => {
        const payload = {
            title: 'Test Project',
            slides: [
                { type: 'TITLE', heading: 'Welcome', subheading: 'Intro' },
                { type: 'CONTENT', heading: 'Info', body: 'Details here' },
                { type: 'CTA', heading: 'Act Now', buttonText: 'Click', subtext: 'Free trial' }
            ]
        };
        const project = ContentMapper.createProjectFromAI(payload);
        expect(project.slides).toHaveLength(3);
        expect(project.slides[0].elements.length).toBeGreaterThan(0);
    });
});
