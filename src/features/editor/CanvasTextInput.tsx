import React, { useEffect, useState } from 'react';
import { useEditorStore } from '@/store/useEditorStore';

interface Props {
    elementId: string;
    initialContent: string;
    onFinish: () => void;
}

export const CanvasTextInput: React.FC<Props> = ({ elementId, initialContent, onFinish }) => {
    const { updateElement, activeSlideId } = useEditorStore();
    const [content, setContent] = useState(initialContent);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            e.stopPropagation();
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onFinish(); return; }
            if (e.key === 'Escape') { onFinish(); return; }
            if (e.key === 'Backspace') { setContent(prev => prev.slice(0, -1)); return; }
            if (e.key.length === 1) { setContent(prev => prev + e.key); }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onFinish]);

    useEffect(() => {
        if (activeSlideId) {
            updateElement(activeSlideId, elementId, { content });
        }
    }, [content, activeSlideId, elementId, updateElement]);

    return null;
};
