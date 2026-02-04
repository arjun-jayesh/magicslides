import React, { useRef, useEffect, useMemo } from 'react';
import { Stage, Layer, Rect, Image } from 'react-konva';
import Konva from 'konva';
import { useEditorStore } from '@/store/useEditorStore';
import { useToast } from '@/components/ui/ToastProvider';
import { getCanvasDimensions, AspectRatioKey } from '@/core/contracts/math.contract';
import ElementRenderer from './ElementRenderer';
import EditorTransformer from './EditorTransformer';
import { TextEditorOverlay } from '../editor/TextEditorOverlay';

// Helper for Background Image
const BackgroundImageNode = ({ src, width, height, filters, scale = 1, position = { x: 0, y: 0 } }: any) => {
    const [image, setImage] = React.useState<HTMLImageElement | undefined>(undefined);

    useEffect(() => {
        if (!src) return;
        const img = new window.Image();
        img.src = src;
        img.crossOrigin = "anonymous";
        img.onload = () => setImage(img);
    }, [src]);

    const activeFilters = useMemo(() => {
        const f = [];
        if (filters.blur > 0) f.push(Konva.Filters.Blur);
        // Brightness: -1 to 1. 0 is normal. User wants "Darken".
        // If brightness is < 0, it darkens.
        if (filters.brightness !== 0) f.push(Konva.Filters.Brighten);
        if (filters.contrast !== 0) f.push(Konva.Filters.Contrast);
        if (filters.saturation !== 0) f.push(Konva.Filters.HSL);
        return f;
    }, [filters]);

    const cropProps = useMemo(() => {
        if (!image) return { x: 0, y: 0, width: 0, height: 0 };

        // Calculate "Cover" Dimensions
        const imageRatio = image.width / image.height;
        const canvasRatio = width / height;


        let cropX = 0;
        let cropY = 0;
        let cropWidth = image.width;
        let cropHeight = image.height;

        // "Cover" logic roughly:
        // We want to fill the canvas.
        // We actually want to determine the *crop rectangle* on the source image.

        if (imageRatio > canvasRatio) {
            // Image is wider than canvas. Crop sides.
            // Match height.
            cropHeight = image.height;
            cropWidth = image.height * canvasRatio;
            cropX = (image.width - cropWidth) / 2;
            cropY = 0;
        } else {
            // Image is taller than canvas. Crop top/bottom.
            // Match width.
            cropWidth = image.width;
            cropHeight = image.width / canvasRatio;
            cropX = 0;
            cropY = (image.height - cropHeight) / 2;
        }

        // Apply Render Scale (user zoom which is actually inverse crop size)
        // If scale > 1, we crop a SMALLER area (zoom in).
        // scale = 1 means defaults cover.
        const zoom = Math.max(0.1, scale); // prevent 0
        const zoomedWidth = cropWidth / zoom;
        const zoomedHeight = cropHeight / zoom;

        // Apply Center Bias adjustment
        cropX += (cropWidth - zoomedWidth) / 2;
        cropY += (cropHeight - zoomedHeight) / 2;

        // Apply Pan (Position) - Percentage of image dimensions? Or pixels?
        // Let's assume position.x/y are pixels in the *source image* domain or similar? 
        // Or simpler: position is relative offset.
        cropX -= position.x;
        cropY -= position.y;

        return {
            x: cropX,
            y: cropY,
            width: zoomedWidth,
            height: zoomedHeight
        };

    }, [image, width, height, scale, position]);

    if (!image) return null;

    return (
        <Image
            x={0}
            y={0}
            width={width}
            height={height}
            crop={cropProps}
            image={image}
            filters={activeFilters}
            opacity={filters.opacity !== undefined ? filters.opacity : 1}
            blurRadius={filters.blur}
            brightness={filters.brightness}
            contrast={filters.contrast}
            saturation={filters.saturation}
            listening={false}
        />
    );
};

export const CanvasStage: React.FC = () => {
    const { project, activeSlideId, clearSelection, editingElementId, updateElement } = useEditorStore();
    const activeSlide = project.slides.find(s => s.id === activeSlideId);
    const { showToast } = useToast();
    const stageRef = useRef<any>(null);
    const replacerRef = useRef<HTMLInputElement>(null);

    const handleGlobalReplace = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        const targetId = (e.target as any)._targetElementId;

        if (file && activeSlideId && targetId) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                const result = ev.target?.result as string;
                updateElement(activeSlideId, targetId, { src: result });
                showToast('Image replaced', 'success');
            };
            reader.readAsDataURL(file);
        }
    };

    const dimensions = getCanvasDimensions((project.aspectRatio as AspectRatioKey) || '1:1');
    const scale = 0.5;

    // V2: Sort elements by zIndex if present, otherwise DOM order matches array order
    const sortedElements = useMemo(() => {
        if (!activeSlide) return [];
        return [...activeSlide.elements].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
    }, [activeSlide]);

    const { updateSlideThumbnail } = useEditorStore();

    useEffect(() => {
        if (!activeSlide || !stageRef.current) return;

        // Debounce thumbnail generation
        const timer = setTimeout(() => {
            try {
                // Generate low-res thumbnail for filmstrip
                // 1080px * 0.2 = ~216px (plenty for 80px filmstrip)
                const dataURL = stageRef.current.toDataURL({ pixelRatio: 0.2 });
                updateSlideThumbnail(activeSlide.id, dataURL);
            } catch (e: any) {
                // If the canvas is tainted, this will fail. We've added CORS fix to help.
                if (e.message?.includes('tainted')) {
                    console.warn("Thumbnail failed: Canvas is tainted. Filters applied to remote images may block export.");
                }
            }
        }, 1000);

        return () => clearTimeout(timer);
    }, [activeSlide, project.updatedAt, updateSlideThumbnail]);

    const handleStageClick = (e: any) => {
        if (e.target === e.target.getStage()) {
            clearSelection();
        }
    };

    if (!activeSlide) return <div className="text-white">No Slide Selected</div>;

    return (
        <div className="relative shadow-2xl bg-gray-800" style={{ width: dimensions.width * scale, height: dimensions.height * scale }}>
            <input
                id="global-image-replacer"
                type="file"
                ref={replacerRef}
                hidden
                onChange={handleGlobalReplace}
                accept="image/*"
            />
            <Stage
                width={dimensions.width * scale}
                height={dimensions.height * scale}
                scaleX={scale}
                scaleY={scale}
                ref={stageRef}
                onClick={handleStageClick}
                listening={!editingElementId}
            >
                <Layer>
                    {/* Background Color */}
                    <Rect
                        x={0}
                        y={0}
                        width={dimensions.width}
                        height={dimensions.height}
                        fill={activeSlide.backgroundColor}
                        listening={false}
                    />

                    {/* V2: Background Image with Filters */}
                    {activeSlide.backgroundImage && (
                        <BackgroundImageNode
                            src={activeSlide.backgroundImage}
                            width={dimensions.width}
                            height={dimensions.height}
                            filters={activeSlide.backgroundFilters || {}}
                            scale={activeSlide.backgroundScale}
                            position={activeSlide.backgroundPosition}
                        />
                    )}

                    {/* Elements */}
                    {activeSlide.glassOverlay?.enabled && (
                        <Rect
                            x={50} // Default padding/offset for glass
                            y={50}
                            width={dimensions.width - 100}
                            height={dimensions.height - 100}
                            fill={activeSlide.glassOverlay.backgroundColor}
                            opacity={activeSlide.glassOverlay.opacity}
                            cornerRadius={activeSlide.glassOverlay.borderRadius}
                            stroke={activeSlide.glassOverlay.border.split(' ')[2]} // Rough extraction
                            strokeWidth={1}
                            shadowBlur={20}
                            shadowColor="rgba(0,0,0,0.5)"
                            listening={false}
                        />
                    )}
                    {sortedElements.map(el => (
                        <ElementRenderer key={el.id} element={el} />
                    ))}

                    {/* Transformer */}
                    {activeSlide.elements.length > 0 && <EditorTransformer />}
                </Layer>
            </Stage>

            {/* Text Editor Overlay */}
            <TextEditorOverlay />
        </div >
    );
};
