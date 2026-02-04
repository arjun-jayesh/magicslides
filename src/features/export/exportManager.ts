import Konva from 'konva';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { Project, ElementType, TextElement, ImageElement } from '@/models/types';
import { getCanvasDimensions, AspectRatioKey } from '@/core/contracts/math.contract';

// Helper to map filter config to Konva Filters
const getFilters = (config: any) => {
    const f = [];
    if (!config) return [];
    if (config.blur > 0) f.push(Konva.Filters.Blur);
    if (config.brightness !== 0) f.push(Konva.Filters.Brighten);
    if (config.contrast !== 0) f.push(Konva.Filters.Contrast);
    if (config.saturation !== 0) f.push(Konva.Filters.HSL);
    return f;
};

export class ExportManager {
    static async exportProject(project: Project) {
        const zip = new JSZip();
        const folder = zip.folder(project.title.replace(/\s+/g, '_')) || zip;

        // Use dynamic dimensions
        // Cast strict type
        const ratioKey = (project.aspectRatio as AspectRatioKey) || '1:1';
        const dims = getCanvasDimensions(ratioKey);

        for (let i = 0; i < project.slides.length; i++) {
            const slide = project.slides[i];

            const stage = new Konva.Stage({
                container: document.createElement('div'),
                width: dims.width,
                height: dims.height
            });

            const layer = new Konva.Layer();
            stage.add(layer);

            // 1. Background Color
            const bg = new Konva.Rect({
                width: dims.width,
                height: dims.height,
                fill: slide.backgroundColor
            });
            layer.add(bg);

            // 2. Background Image?
            if (slide.backgroundImage) {
                await new Promise<void>((resolve) => {
                    const imgObj = new window.Image();
                    imgObj.onload = () => {
                        const kImg = new Konva.Image({
                            image: imgObj,
                            width: dims.width, height: dims.height,
                            filters: getFilters(slide.backgroundFilters),
                            blurRadius: slide.backgroundFilters.blur,
                            brightness: slide.backgroundFilters.brightness,
                            contrast: slide.backgroundFilters.contrast,
                            saturation: slide.backgroundFilters.saturation
                        });
                        kImg.cache(); // Critical for filters
                        layer.add(kImg);
                        resolve();
                    }
                    imgObj.onerror = () => resolve(); // Skip if fail
                    imgObj.src = slide.backgroundImage!;
                    // Handle CrossOrigin if needed, but local blob/dataURL usually fine
                });
            }

            // 3. Elements (Sort by Z-Index)
            const sorted = [...slide.elements].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

            // Use Promise.all to handle image loading logic if we had external images
            // For now assuming synch/local or async wait needed. 
            // We will make the loop awaitable.

            for (const el of sorted) {
                const common = {
                    x: el.x, y: el.y, width: el.width, height: el.height, rotation: el.rotation,
                    opacity: el.opacity
                };

                if (el.type === ElementType.TEXT) {
                    const textEl = el as TextElement;
                    const config: any = {
                        ...common,
                        text: textEl.content,
                        fontSize: textEl.fontSize,
                        fontFamily: textEl.fontFamily,
                        fontStyle: typeof textEl.fontWait === 'string' ? textEl.fontWait : undefined,
                        align: textEl.align,
                        verticalAlign: textEl.verticalAlign,
                        lineHeight: textEl.lineHeight
                    };

                    // Gradients
                    if (textEl.gradient?.enabled && textEl.gradient.colors.length >= 2) {
                        config.fillLinearGradientStartPoint = { x: 0, y: 0 };
                        config.fillLinearGradientEndPoint = { x: 0, y: el.height };
                        config.fillLinearGradientColorStops = [0, textEl.gradient.colors[0], 1, textEl.gradient.colors[1]];
                        config.fillPriority = 'linear-gradient';
                    } else {
                        config.fill = textEl.fill;
                    }

                    layer.add(new Konva.Text(config));

                } else if (el.type === ElementType.IMAGE) {
                    const imgEl = el as ImageElement;
                    await new Promise<void>((resolve) => {
                        const io = new window.Image();
                        io.onload = () => {
                            const kImg = new Konva.Image({
                                ...common,
                                image: io,
                                filters: getFilters(imgEl.filters),
                                blurRadius: imgEl.filters?.blur || 0,
                                brightness: imgEl.filters?.brightness || 0,
                                contrast: imgEl.filters?.contrast || 0,
                                saturation: imgEl.filters?.saturation || 0
                            });
                            if (imgEl.filters) kImg.cache();
                            layer.add(kImg);
                            resolve();
                        };
                        io.onerror = () => resolve();
                        io.src = imgEl.src;
                    });
                } else if (el.type === ElementType.SHAPE && el.shapeType === 'rect') {
                    layer.add(new Konva.Rect({
                        ...common,
                        fill: el.fill, stroke: el.stroke, strokeWidth: el.strokeWidth
                    }));
                }
            }

            layer.draw();

            const dataUrl = stage.toDataURL({ pixelRatio: 1, mimeType: 'image/png' });
            const base64 = dataUrl.split(',')[1];
            stage.destroy();

            folder.file(`slide_${i + 1}.png`, base64, { base64: true });
        }

        const content = await zip.generateAsync({ type: 'blob' });
        saveAs(content, `${project.title}_carousel.zip`);
    }
}
