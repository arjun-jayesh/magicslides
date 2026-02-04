import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { v4 as uuidv4 } from 'uuid';
import { LayoutPreset } from '@/models/types';

interface PresetState {
    presets: LayoutPreset[];
    activePresetId: string | null;

    // Actions
    addPreset: (preset: LayoutPreset) => void;
    updatePreset: (id: string, updates: Partial<LayoutPreset>) => void;
    deletePreset: (id: string) => void;
    setActivePreset: (id: string) => void;
}

const DEFAULT_PRESETS: LayoutPreset[] = [
    {
        id: 'preset_modern',
        name: 'Modern Blue',
        fonts: {
            heading: 'Inter',
            body: 'Inter'
        },
        colorPalette: {
            primary: '#3B82F6',
            secondary: '#1D4ED8',
            background: '#0F172A',
            text: '#F8FAFC'
        },
        filterDefaults: { blur: 0, brightness: 0, contrast: 0, saturation: 0 },
        glassSettings: {
            enabled: true,
            backgroundColor: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: 16,
            border: '1px solid rgba(255,255,255,0.1)',
            opacity: 1
        },
        spacing: 40
    },
    {
        id: 'preset_minimal',
        name: 'Minimal White',
        fonts: {
            heading: 'Outfit',
            body: 'Inter'
        },
        colorPalette: {
            primary: '#000000',
            secondary: '#4B5563',
            background: '#FFFFFF',
            text: '#111827'
        },
        filterDefaults: { blur: 0, brightness: 0, contrast: 0, saturation: 0 },
        glassSettings: {
            enabled: false,
            backgroundColor: 'rgba(0,0,0,0.05)',
            backdropFilter: 'none',
            borderRadius: 8,
            border: '1px solid rgba(0,0,0,0.1)',
            opacity: 1
        },
        spacing: 60
    },
    {
        id: 'preset_bold',
        name: 'Bold Dark',
        fonts: {
            heading: 'Archivo Black',
            body: 'Archivo'
        },
        colorPalette: {
            primary: '#F59E0B',
            secondary: '#D97706',
            background: '#000000',
            text: '#FFFFFF'
        },
        filterDefaults: { blur: 0, brightness: -0.2, contrast: 0.1, saturation: 0 },
        glassSettings: {
            enabled: true,
            backgroundColor: 'rgba(255,150,0,0.15)',
            backdropFilter: 'blur(12px)',
            borderRadius: 20,
            border: '1px solid rgba(255,150,0,0.3)',
            opacity: 1
        },
        spacing: 30
    },
    {
        id: 'preset_pastel',
        name: 'Pastel Dream',
        fonts: {
            heading: 'Outfit',
            body: 'Inter'
        },
        colorPalette: {
            primary: '#F472B6',
            secondary: '#FBCFE8',
            background: '#FFF5F7',
            text: '#831843'
        },
        filterDefaults: { blur: 0, brightness: 0, contrast: 0, saturation: 0 },
        glassSettings: {
            enabled: true,
            backgroundColor: 'rgba(255,255,255,0.4)',
            backdropFilter: 'blur(5px)',
            borderRadius: 24,
            border: '2px solid rgba(255,255,255,0.5)',
            opacity: 1
        },
        spacing: 45
    },
    {
        id: 'preset_dark',
        name: 'Cyber Dark',
        fonts: {
            heading: 'Inter',
            body: 'Inter'
        },
        colorPalette: {
            primary: '#10B981',
            secondary: '#065F46',
            background: '#020617',
            text: '#F1F5F9'
        },
        filterDefaults: { blur: 0, brightness: -0.3, contrast: 0.2, saturation: -0.1 },
        glassSettings: {
            enabled: true,
            backgroundColor: 'rgba(15,23,42,0.6)',
            backdropFilter: 'blur(15px)',
            borderRadius: 12,
            border: '1px solid rgba(16,185,129,0.3)',
            opacity: 1
        },
        spacing: 35
    }
];

export const usePresetStore = create<PresetState>()(
    persist(
        immer((set) => ({
            presets: DEFAULT_PRESETS,
            activePresetId: 'preset_modern',

            addPreset: (preset) => set((state) => {
                state.presets.push(preset);
            }),

            updatePreset: (id, updates) => set((state) => {
                const index = state.presets.findIndex(p => p.id === id);
                if (index !== -1) {
                    // Prevent overwriting built-in presets if we want them read-only
                    if (state.presets[index].id.startsWith('preset_')) {
                        console.warn("Attempting to edit a built-in preset. Creating copy instead.");
                        const copy = { ...state.presets[index], ...updates, id: uuidv4(), name: `${state.presets[index].name} (Copy)` };
                        state.presets.push(copy);
                        state.activePresetId = copy.id;
                    } else {
                        Object.assign(state.presets[index], updates);
                    }
                }
            }),

            deletePreset: (id) => set((state) => {
                if (id.startsWith('preset_')) return; // Built-in protection
                state.presets = state.presets.filter(p => p.id !== id);
                if (state.activePresetId === id) state.activePresetId = 'preset_modern';
            }),

            setActivePreset: (id) => set({ activePresetId: id })
        })),
        {
            name: 'magic-slide-presets'
        }
    )
);
