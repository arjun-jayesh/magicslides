import React, { useEffect, useRef, useState } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { TextElement, ElementType } from '@/models/types';

export const TextEditorOverlay: React.FC = () => {
    const {
        project,
        activeSlideId,
        editingElementId,
        setEditingElement,
        updateElement
    } = useEditorStore();

    const activeSlide = project.slides.find(s => s.id === activeSlideId);
    const element = activeSlide?.elements.find(e => e.id === editingElementId);

    // Safety check
    if (!element || element.type !== ElementType.TEXT) {
        if (editingElementId) setEditingElement(null);
        return null;
    }

    const textEl = element as TextElement;
    const [value, setValue] = useState(textEl.content);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Sync initial value when opening
    useEffect(() => {
        setValue(textEl.content);
        if (textareaRef.current) {
            // Focus and auto-select
            textareaRef.current.focus();
            textareaRef.current.select();
        }
    }, [editingElementId]); // Only re-run when ID changes

    const handleBlur = () => {
        save();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            // Cancel? Or Save? Usually Save.
            setEditingElement(null); // Cancel edits (revert to previous?) 
            // If we want to cancel, we just close. If save, we call save().
            // Let's assume Save on Escape for now to be safe, or Cancel if user expects it.
            // Standard: Escape cancels, Enter (if single line) or Ctrl+Enter saves.
            // But this is multiline text likely.
            setEditingElement(null); // Just close (cancel)
        }
        // Shift+Enter for new line is default in textarea.
        // Maybe Ctrl+Enter to save?
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            save();
        }
    };

    const save = () => {
        if (value !== textEl.content) {
            updateElement(activeSlideId!, element.id, { content: value });
        }
        setEditingElement(null);
    };

    // Style Calculation
    const scale = 0.5; // HARDCODED in CanvasStage, must match!

    // We need to match the canvas transform.
    // x, y on canvas -> x*scale, y*scale on screen relative to container
    // width, height -> width*scale, height*scale
    // fontSize -> fontSize*scale

    const style: React.CSSProperties = {
        position: 'absolute',
        left: element.x * scale,
        top: element.y * scale,
        width: element.width * scale,
        height: element.height * scale, // Or auto-grow?

        fontSize: `${textEl.fontSize * scale}px`,
        fontFamily: textEl.fontFamily,
        fontWeight: textEl.fontWait,
        color: textEl.fill, // Text color
        lineHeight: textEl.lineHeight,
        textAlign: textEl.align,

        background: 'transparent',
        border: '1px dashed #3b82f6', // Helper border
        padding: 0,
        margin: 0,
        outline: 'none',
        resize: 'none',
        overflow: 'hidden',
        zIndex: 9999,

        transform: `rotate(${element.rotation}deg)`,
        transformOrigin: 'top left',
    };

    return (
        <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            style={style}
            spellCheck={false}
        />
    );
};
