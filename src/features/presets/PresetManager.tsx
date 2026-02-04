import React from 'react';
import { usePresetStore } from '@/store/presetStore';
import { useEditorStore } from '@/store/useEditorStore';
import { LayoutPreset, ElementType, TextElement } from '@/models/types';
import { Palette, Check, Info } from 'lucide-react';

export const PresetManager: React.FC = () => {
    const { presets, activePresetId, setActivePreset } = usePresetStore();
    const { project, updateSlide, updateElement, applyGlobalBackgroundColor } = useEditorStore();

    const applyPreset = (preset: LayoutPreset) => {
        setActivePreset(preset.id);

        // 1. Apply Global Background Color
        applyGlobalBackgroundColor(preset.colorPalette.background);

        // 2. Update all slides and elements
        project.slides.forEach(slide => {
            // Apply filter defaults to background
            updateSlide(slide.id, {
                backgroundFilters: { ...preset.filterDefaults }
            });

            // Update Text Elements with new fonts and colors
            slide.elements.forEach(el => {
                if (el.type === ElementType.TEXT) {
                    const textEl = el as TextElement;
                    const isHeading = textEl.fontSize > 40;

                    updateElement(slide.id, el.id, {
                        fontFamily: isHeading ? preset.fonts.heading : preset.fonts.body,
                        fill: isHeading ? preset.colorPalette.text : preset.colorPalette.accent || preset.colorPalette.text,
                    });
                }
            });
        });
    };

    return (
        <div className="p-4 bg-gray-900/50 rounded-xl border border-gray-700 mt-4">
            <div className="flex items-center gap-2 mb-4">
                <Palette className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-semibold text-white">Design Presets</h3>
            </div>

            <div className="grid grid-cols-1 gap-3">
                {presets.map((preset) => (
                    <button
                        key={preset.id}
                        onClick={() => applyPreset(preset)}
                        className={`relative p-3 rounded-lg border transition-all text-left overflow-hidden group ${activePresetId === preset.id
                                ? 'border-blue-500 bg-blue-500/10'
                                : 'border-gray-700 bg-gray-800 hover:border-gray-500'
                            }`}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-200">{preset.name}</span>
                            {activePresetId === preset.id && <Check className="w-4 h-4 text-blue-400" />}
                        </div>

                        <div className="flex gap-2 h-6 items-center">
                            <div className="w-4 h-4 rounded-full border border-gray-600" style={{ backgroundColor: preset.colorPalette.primary }} title="Primary" />
                            <div className="w-4 h-4 rounded-full border border-gray-600" style={{ backgroundColor: preset.colorPalette.background }} title="Background" />
                            <div className="w-4 h-4 rounded-full border border-gray-600" style={{ backgroundColor: preset.colorPalette.text }} title="Text" />
                            <div className="ml-2 text-xs text-gray-500 font-mono tracking-tighter">
                                {preset.fonts.heading} / {preset.fonts.body}
                            </div>
                        </div>

                        {preset.glassSettings.enabled && (
                            <div className="absolute top-1 right-1 opacity-20 group-hover:opacity-100 transition-opacity">
                                <Info className="w-3 h-3 text-blue-200" />
                            </div>
                        )}
                    </button>
                ))}
            </div>

            <p className="text-[10px] text-gray-500 mt-4 leading-tight italic">
                * Applying a preset will update all slides in your current project to maintain branding consistency.
            </p>
        </div>
    );
};
