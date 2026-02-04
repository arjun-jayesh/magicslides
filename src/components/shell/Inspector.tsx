import React, { useRef } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { AspectRatio, ElementType, TextElement } from '@/models/types';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/components/ui/ToastProvider';

export const Inspector = () => {
    const {
        project,
        activeSlideId,
        selectedIds,
        setProject,
        updateElement,
        addElement,
        applyGlobalBackground,
        applyGlobalBackgroundColor,
        updateSlide,
        applyGlobalFilters,
        applyGlobalBackgroundTransform,
        applyGlobalHeadingSize,
        applyGlobalContentSize,
        deleteElement
    } = useEditorStore();

    const { showToast } = useToast();

    const activeSlide = project.slides.find(s => s.id === activeSlideId);
    const selectedId = selectedIds[0];
    const selectedElement = activeSlide?.elements.find(e => e.id === selectedId);

    // File inputs
    const bgInputRef = useRef<HTMLInputElement>(null);
    const slideImageInputRef = useRef<HTMLInputElement>(null);

    // --- HANDLERS ---

    const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                const result = ev.target?.result as string;
                applyGlobalBackground(result, activeSlide?.backgroundFilters);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAddImageToSlide = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && activeSlideId) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                const result = ev.target?.result as string;
                // Add as new Image Element
                addElement(activeSlideId, {
                    id: uuidv4(),
                    type: ElementType.IMAGE,
                    src: result,
                    x: 100, y: 100,
                    width: 300, height: 300,
                    rotation: 0,
                    opacity: 1,
                    locked: false,
                    zIndex: 10,
                    maintainAspectRatio: true,
                    name: 'Image'
                } as any);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAspectRatioChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setProject({ ...project, aspectRatio: e.target.value as any });
    };

    if (!activeSlide) return <div className="w-64 bg-gray-900 border-l border-gray-700 p-4">No Slide</div>;

    return (
        <div className="w-64 bg-gray-900 border-l border-gray-700 flex flex-col overflow-y-auto text-sm text-gray-300 custom-scrollbar">
            {!selectedElement ? (
                // --- SLIDE SETTINGS ---
                <div className="p-4 space-y-6">
                    <div>
                        <h3 className="font-bold text-white mb-2">Slide Settings</h3>
                        <div className="space-y-1">
                            <label className="text-xs">Project Aspect Ratio</label>
                            <select
                                value={project.aspectRatio}
                                onChange={handleAspectRatioChange}
                                className="w-full bg-gray-800 border border-gray-600 rounded p-1"
                            >
                                <option value={AspectRatio.RATIO_1_1}>1:1 (Square)</option>
                                <option value={AspectRatio.RATIO_16_9}>16:9 (Landscape)</option>
                                <option value={AspectRatio.RATIO_4_5}>4:5 (Portrait)</option>
                            </select>
                        </div>
                    </div>

                    <div className="border-t border-gray-700 pt-4">
                        <h3 className="font-bold text-white mb-2">Background</h3>

                        {/* Color */}
                        <div className="mb-3">
                            <label className="block text-xs mb-1">Background Color</label>
                            <div className="flex space-x-2 mb-2">
                                <input
                                    type="color"
                                    value={activeSlide.backgroundColor}
                                    onChange={(e) => updateSlide(activeSlide.id, { backgroundColor: e.target.value })}
                                    className="h-8 w-8 bg-transparent border-none cursor-pointer"
                                />
                                <input
                                    type="text"
                                    value={activeSlide.backgroundColor}
                                    onChange={(e) => updateSlide(activeSlide.id, { backgroundColor: e.target.value })}
                                    className="flex-1 bg-gray-800 border border-gray-600 rounded p-1 font-mono text-xs uppercase"
                                />
                            </div>
                            <button
                                onClick={() => {
                                    applyGlobalBackgroundColor(activeSlide.backgroundColor);
                                    showToast('Applied background color to all slides', 'success');
                                }}
                                className="w-full bg-blue-600/20 hover:bg-blue-600/40 text-blue-200 p-1 rounded text-xs border border-blue-600/50"
                            >
                                Apply Color to All Slides
                            </button>
                        </div>

                        {/* Image */}
                        <div>
                            <label className="block text-xs mb-1">Global Background Image</label>
                            <input type="file" ref={bgInputRef} hidden onChange={handleBgUpload} accept="image/*" />
                            <button
                                onClick={() => bgInputRef.current?.click()}
                                className="w-full bg-gray-700 hover:bg-gray-600 text-white p-2 rounded text-xs mb-2"
                            >
                                {activeSlide.backgroundImage ? 'Change Global BG' : 'Upload Global BG'}
                            </button>
                            {activeSlide.backgroundImage && (
                                <button
                                    onClick={() => {
                                        applyGlobalBackground('', activeSlide.backgroundFilters);
                                        showToast('Background image removed', 'info');
                                    }}
                                    className="w-full bg-red-900/50 hover:bg-red-900 text-red-200 p-1 rounded text-xs"
                                >
                                    Remove Background Image
                                </button>
                            )}
                        </div>

                        {/* Background Styling Controls */}
                        {activeSlide.backgroundImage && (
                            <div className="mt-3 space-y-2 border-t border-gray-700 pt-2">
                                <label className="text-xs font-semibold text-gray-300">Image Styling (Global)</label>

                                {/* Blur */}
                                <div>
                                    <div className="flex justify-between text-[10px] text-gray-400">
                                        <span>Blur</span>
                                        <span>{activeSlide.backgroundFilters?.blur || 0}px</span>
                                    </div>
                                    <input
                                        type="range" min="0" max="20" step="1"
                                        value={activeSlide.backgroundFilters?.blur || 0}
                                        onChange={(e) => {
                                            const newFilters = { ...activeSlide.backgroundFilters, blur: parseInt(e.target.value) };
                                            // Apply Global
                                            applyGlobalFilters(newFilters);
                                        }}
                                        className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                    />
                                </div>

                                {/* Darken (Brightness) */}
                                <div>
                                    <div className="flex justify-between text-[10px] text-gray-400">
                                        <span>Darkness</span>
                                        <span>{Math.round((activeSlide.backgroundFilters?.brightness || 0) * -100)}%</span>
                                    </div>
                                    <input
                                        type="range" min="-0.8" max="0.2" step="0.05"
                                        value={activeSlide.backgroundFilters?.brightness || 0}
                                        onChange={(e) => {
                                            const newFilters = { ...activeSlide.backgroundFilters, brightness: parseFloat(e.target.value) };
                                            applyGlobalFilters(newFilters);
                                        }}
                                        className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer dir-rtl"
                                    />
                                </div>

                                {/* Zoom (Crop) */}
                                <div>
                                    <div className="flex justify-between text-[10px] text-gray-400">
                                        <span>Zoom / Crop</span>
                                        <span>{Math.round((activeSlide.backgroundScale || 1) * 100)}%</span>
                                    </div>
                                    <input
                                        type="range" min="1" max="3" step="0.1"
                                        value={activeSlide.backgroundScale || 1}
                                        onChange={(e) => {
                                            const scale = parseFloat(e.target.value);
                                            applyGlobalBackgroundTransform(scale, activeSlide.backgroundPosition || { x: 0, y: 0 });
                                        }}
                                        className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="border-t border-gray-700 pt-4">
                        <h3 className="font-bold text-white mb-2">Global Typography</h3>
                        <div className="space-y-4 text-xs">
                            <div>
                                <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                                    <span>Heading Size</span>
                                    <span>69px</span>
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        className="w-full bg-gray-800 border border-gray-600 rounded p-1 text-xs"
                                        placeholder="Heading Size"
                                        defaultValue={69}
                                        onBlur={(e) => applyGlobalHeadingSize(parseInt(e.target.value))}
                                    />
                                    <button
                                        onClick={() => applyGlobalHeadingSize(69)}
                                        className="text-[10px] bg-gray-700 px-2 rounded hover:bg-gray-600 transition-colors"
                                    >Reset</button>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                                    <span>Content Size</span>
                                    <span>54px</span>
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        className="w-full bg-gray-800 border border-gray-600 rounded p-1 text-xs"
                                        placeholder="Content Size"
                                        defaultValue={54}
                                        onBlur={(e) => applyGlobalContentSize(parseInt(e.target.value))}
                                    />
                                    <button
                                        onClick={() => applyGlobalContentSize(54)}
                                        className="text-[10px] bg-gray-700 px-2 rounded hover:bg-gray-600 transition-colors"
                                    >Reset</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-700 pt-4">
                        <h3 className="font-bold text-white mb-2">Assets</h3>
                        <label className="block text-xs mb-1">Add to THIS Slide</label>
                        <input type="file" ref={slideImageInputRef} hidden onChange={handleAddImageToSlide} accept="image/*" />
                        <button
                            onClick={() => slideImageInputRef.current?.click()}
                            className="w-full bg-blue-700 hover:bg-blue-600 text-white p-2 rounded text-xs"
                        >
                            + Add Image
                        </button>
                    </div>
                </div>
            ) : (
                // --- ELEMENT SETTINGS ---
                <div className="p-4 space-y-6">
                    <div className="flex justify-between items-center mb-2 border-b border-gray-700 pb-2">
                        <h3 className="font-bold text-white uppercase text-xs tracking-wider">Edit {selectedElement.type}</h3>
                        <div className="text-xs text-gray-500 font-mono">{selectedElement.id.slice(-4)}</div>
                    </div>

                    {/* 1. LAYOUT & POSITION (Simplified) */}
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="text-[10px] text-gray-400">X</label>
                            <input
                                type="number"
                                value={Math.round(selectedElement.x)}
                                onChange={(e) => updateElement(activeSlideId!, selectedId, { x: parseInt(e.target.value) })}
                                className="w-full bg-gray-800 border border-gray-600 rounded p-1 text-xs"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] text-gray-400">Y</label>
                            <input
                                type="number"
                                value={Math.round(selectedElement.y)}
                                onChange={(e) => updateElement(activeSlideId!, selectedId, { y: parseInt(e.target.value) })}
                                className="w-full bg-gray-800 border border-gray-600 rounded p-1 text-xs"
                            />
                        </div>
                    </div>

                    {/* 2. APPEARANCE (Opacity, Layer) */}
                    <div className="space-y-2">
                        <h4 className="text-xs font-semibold text-gray-300">Appearance</h4>
                        <div>
                            <label className="text-xs flex justify-between">
                                <span>Opacity</span>
                                <span>{Math.round(selectedElement.opacity * 100)}%</span>
                            </label>
                            <input
                                type="range" min="0" max="1" step="0.05"
                                value={selectedElement.opacity}
                                onChange={(e) => updateElement(activeSlideId!, selectedId, { opacity: parseFloat(e.target.value) })}
                                className="w-full accent-blue-500 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                        <div className="flex gap-1">
                            <button className="flex-1 bg-gray-800 hover:bg-gray-700 p-1 rounded text-[10px]" onClick={() => updateElement(activeSlideId!, selectedId, { zIndex: (selectedElement.zIndex || 0) + 1 })}>Bring Fwd</button>
                            <button className="flex-1 bg-gray-800 hover:bg-gray-700 p-1 rounded text-[10px]" onClick={() => updateElement(activeSlideId!, selectedId, { zIndex: (selectedElement.zIndex || 0) - 1 })}>Send Back</button>
                        </div>
                    </div>

                    {/* 3. BORDERS & CORNERS */}
                    <div className="space-y-3 pt-2 border-t border-gray-700">
                        <h4 className="text-xs font-semibold text-gray-300">Border & Radius</h4>

                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-xs block mb-1">C. Radius</label>
                                <input
                                    type="number"
                                    value={selectedElement.cornerRadius || 0}
                                    onChange={(e) => updateElement(activeSlideId!, selectedId, { cornerRadius: parseInt(e.target.value) })}
                                    className="w-full bg-gray-800 border border-gray-600 rounded p-1 text-xs"
                                />
                            </div>
                            <div>
                                <label className="text-xs block mb-1">Width</label>
                                <input
                                    type="number"
                                    value={selectedElement.strokeWidth || 0}
                                    onChange={(e) => updateElement(activeSlideId!, selectedId, { strokeWidth: parseInt(e.target.value) })}
                                    className="w-full bg-gray-800 border border-gray-600 rounded p-1 text-xs"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs block mb-1">Border Color</label>
                            <div className="flex space-x-2">
                                <input
                                    type="color"
                                    value={selectedElement.stroke || '#000000'}
                                    onChange={(e) => updateElement(activeSlideId!, selectedId, { stroke: e.target.value })}
                                    className="h-6 w-6 border-none bg-transparent p-0 cursor-pointer"
                                />
                                <input
                                    type="text"
                                    value={selectedElement.stroke || ''}
                                    placeholder="None"
                                    onChange={(e) => updateElement(activeSlideId!, selectedId, { stroke: e.target.value })}
                                    className="flex-1 bg-gray-800 border border-gray-600 rounded px-1 text-xs"
                                />
                            </div>
                        </div>
                    </div>

                    {/* 4. TEXT SPECIFIC */}
                    {selectedElement.type === ElementType.TEXT && (() => {
                        const textEl = selectedElement as TextElement;
                        return (
                            <div className="space-y-3 pt-2 border-t border-gray-700">
                                <h4 className="text-xs font-semibold text-gray-300">Typography</h4>
                                <div>
                                    <label className="text-xs block mb-1">Color</label>
                                    <div className="flex space-x-2">
                                        <input
                                            type="color"
                                            value={textEl.fill}
                                            onChange={(e) => updateElement(activeSlideId!, selectedId, { fill: e.target.value })}
                                            className="h-6 w-6 border-none bg-transparent p-0 cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            value={textEl.fill}
                                            onChange={(e) => updateElement(activeSlideId!, selectedId, { fill: e.target.value })}
                                            className="flex-1 bg-gray-800 border border-gray-600 rounded px-1 text-xs"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="text-xs block mb-1">Size</label>
                                        <input
                                            type="number"
                                            value={textEl.fontSize}
                                            onChange={(e) => updateElement(activeSlideId!, selectedId, { fontSize: parseInt(e.target.value) })}
                                            className="w-full bg-gray-800 border border-gray-600 rounded p-1 text-xs"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs block mb-1">Weight</label>
                                        <select
                                            value={textEl.fontWait}
                                            onChange={(e) => updateElement(activeSlideId!, selectedId, { fontWait: parseInt(e.target.value) })}
                                            className="w-full bg-gray-800 border border-gray-600 rounded p-1 text-xs"
                                        >
                                            <option value={100}>Thin</option>
                                            <option value={300}>Light</option>
                                            <option value={400}>Regular</option>
                                            <option value={600}>SemiBold</option>
                                            <option value={700}>Bold</option>
                                            <option value={900}>Black</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs block mb-1">Alignment</label>
                                    <div className="flex bg-gray-800 rounded border border-gray-600 overflow-hidden">
                                        {['left', 'center', 'right', 'justify'].map((align) => (
                                            <button
                                                key={align}
                                                onClick={() => updateElement(activeSlideId!, selectedId, { align: align as any })}
                                                className={`flex-1 p-1 hover:bg-gray-700 ${textEl.align === align ? 'bg-gray-700 text-white' : 'text-gray-400'}`}
                                            >
                                                <span className="capitalize">{align[0]}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        );
                    })()}

                    {/* 5. DELETE */}
                    <div className="pt-4 mt-4 border-t border-gray-700">
                        <button
                            className="w-full py-2 bg-red-900/40 hover:bg-red-900/60 text-red-200 text-xs rounded border border-red-900 transition-colors"
                            onClick={() => {
                                if (activeSlideId && selectedId) {
                                    deleteElement(activeSlideId, selectedId);
                                }
                            }}
                        >
                            Delete Element
                        </button>
                    </div>
                </div>
            )
            }
        </div >
    );
};
