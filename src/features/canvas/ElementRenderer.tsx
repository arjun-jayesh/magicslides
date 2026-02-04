import { Text, Rect, Image as KonvaImage } from 'react-konva';
import { CanvasElement, ElementType, TextElement, ImageElement } from '@/models/types';
import { useEditorStore } from '@/store/useEditorStore';
import React, { useState, useEffect } from 'react';

import Konva from 'konva';

interface Props {
    element: CanvasElement;
}

const useCustomImage = (src: string) => {
    const [image, setImage] = useState<HTMLImageElement | undefined>(undefined);
    useEffect(() => {
        if (!src) return;
        const img = new window.Image();
        img.src = src;
        img.onload = () => setImage(img);
    }, [src]);
    return [image];
};

const ElementImageRenderer: React.FC<{ element: CanvasElement, commonProps: any }> = ({ element, commonProps }) => {
    const imgEl = element as ImageElement;
    const [image] = useCustomImage(imgEl.src);
    const imageRef = React.useRef<any>(null);

    const filters = imgEl.filters || { blur: 0, brightness: 0, contrast: 0, saturation: 0 };

    const activeFilters = React.useMemo(() => {
        const f = [];
        if (filters.blur > 0) f.push(Konva.Filters.Blur);
        if (filters.brightness !== 0) f.push(Konva.Filters.Brighten);
        if (filters.contrast !== 0) f.push(Konva.Filters.Contrast);
        if (filters.saturation !== 0) f.push(Konva.Filters.HSL);
        return f;
    }, [filters]);

    useEffect(() => {
        if (imageRef.current) {
            imageRef.current.cache();
        }
    }, [image, filters, imgEl.width, imgEl.height]); // Re-cache on change

    return (
        <KonvaImage
            ref={imageRef}
            {...commonProps}
            image={image}
            stroke={imgEl.stroke}
            strokeWidth={imgEl.strokeWidth}
            cornerRadius={imgEl.cornerRadius}
            crop={imgEl.crop}
            filters={activeFilters}
            blurRadius={filters.blur}
            brightness={filters.brightness}
            contrast={filters.contrast}
            saturation={filters.saturation}
        />
    );
};

const ElementRenderer: React.FC<Props> = ({ element }) => {
    const { select, updateElement, setEditingElement, editingElementId } = useEditorStore();

    const isEditing = editingElementId === element.id;

    const commonProps = {
        x: element.x,
        y: element.y,
        width: element.width,
        height: element.height,
        rotation: element.rotation,
        id: element.id,
        opacity: isEditing ? 0 : element.opacity, // Hide when editing
        draggable: !element.locked && !isEditing,
        onClick: (e: any) => {
            e.cancelBubble = true;
            select(element.id);
        },
        onDblClick: (e: any) => {
            e.cancelBubble = true;
            if (element.type === ElementType.TEXT && !element.locked) {
                setEditingElement(element.id);
            }
        },
        onDragEnd: (e: any) => {
            updateElement(useEditorStore.getState().activeSlideId!, element.id, {
                x: e.target.x(),
                y: e.target.y()
            });
        },
        onTransformEnd: (e: any) => {
            // V2: Persist transform
            const node = e.target;
            updateElement(useEditorStore.getState().activeSlideId!, element.id, {
                x: node.x(),
                y: node.y(),
                width: node.width() * node.scaleX(),
                height: node.height() * node.scaleY(),
                rotation: node.rotation()
            });
            node.scaleX(1);
            node.scaleY(1);
        }
    };

    if (element.type === ElementType.TEXT) {
        const textEl = element as TextElement;

        // Gradient Logic
        // Konva Text supports fillLinearGradient... props
        const gradientProps: any = {};

        if (textEl.gradient?.enabled && textEl.gradient.colors.length >= 2) {
            // Calculate start/end based on angle (simplified to Top-Bottom or Left-Right for now)
            // Real expansion requires math for arbitrary angle
            gradientProps.fillLinearGradientStartPoint = { x: 0, y: 0 };
            gradientProps.fillLinearGradientEndPoint = { x: 0, y: element.height };
            gradientProps.fillLinearGradientColorStops = [
                0, textEl.gradient.colors[0],
                1, textEl.gradient.colors[1]
            ];
            gradientProps.fillPriority = 'linear-gradient';
        } else {
            gradientProps.fill = textEl.fill;
        }

        return (
            <Text
                {...commonProps}
                text={textEl.content}
                fontSize={textEl.fontSize}
                fontFamily={textEl.fontFamily}
                fontStyle={typeof textEl.fontWait === 'string' ? textEl.fontWait : undefined} // Map weight
                align={textEl.align}
                verticalAlign={textEl.verticalAlign}
                lineHeight={textEl.lineHeight}
                stroke={element.stroke}
                strokeWidth={element.strokeWidth}
                // Text doesn't support cornerRadius on the text itself usually, but maybe background?
                // Konva Text doesn't have cornerRadius. We might need a Group if we want that.
                // For now, allow stroke.
                {...gradientProps}
            />
        );
    } else if (element.type === ElementType.SHAPE) {
        if (element.shapeType === 'rect') {
            return (
                <Rect
                    {...commonProps}
                    fill={element.fill}
                    stroke={element.stroke}
                    strokeWidth={element.strokeWidth}
                    cornerRadius={element.cornerRadius}
                />
            );
        } else if (element.shapeType === 'circle') {
            // ... logic for circle?
        }
    } else if (element.type === ElementType.IMAGE) {
        // We need Image component imported from react-konva if not already?
        // It is not imported! Wait, ElementRenderer imports Text, Rect.
        // We need Image.
        return <ElementImageRenderer element={element} commonProps={commonProps} />;
    }

    return null;
};

export default ElementRenderer;
