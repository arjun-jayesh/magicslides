import React, { useEffect, useRef } from 'react';
import { Transformer } from 'react-konva';
import { useEditorStore } from '@/store/useEditorStore';

const EditorTransformer: React.FC = () => {
    const { selectedIds, activeSlideId, editingElementId } = useEditorStore();
    const trRef = useRef<any>(null);

    useEffect(() => {
        if (!trRef.current) return;

        if (editingElementId) {
            trRef.current.nodes([]);
            trRef.current.getLayer().batchDraw();
            return;
        }

        const stage = trRef.current.getStage();
        if (!stage) return;

        // Use IDs to find nodes
        const selectedNodes = selectedIds.map(id => stage.findOne('#' + id)).filter(Boolean);

        trRef.current.nodes(selectedNodes);
        trRef.current.getLayer().batchDraw();

    }, [selectedIds, activeSlideId]);

    return (
        <Transformer
            ref={trRef}
            boundBoxFunc={(oldBox, newBox) => {
                // Enforce minimum size
                if (newBox.width < 5 || newBox.height < 5) {
                    return oldBox;
                }
                return newBox;
            }}
            enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
            rotationSnaps={[0, 90, 180, 270]}
        />
    );
};

export default EditorTransformer;
