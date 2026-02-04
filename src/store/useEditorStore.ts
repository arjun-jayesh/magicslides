import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { devtools } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Project, Slide, CanvasElement, AspectRatio } from '@/models/types';
import { createSelectionSlice, SelectionSlice } from './selectionSlice';

/**
 * Editor State Interface
 */
interface EditorState extends SelectionSlice {
    project: Project;
    activeSlideId: string | null;
    editingElementId: string | null; // For text editing overlay
    past: Project[];
    future: Project[];

    // Actions
    setProject: (project: Project) => void;
    addSlide: () => void;
    setActiveSlide: (id: string) => void;
    updateElement: (slideId: string, elementId: string, updates: Partial<CanvasElement>) => void;
    addElement: (slideId: string, element: CanvasElement) => void;
    // Global Actions
    applyGlobalBackground: (image: string, filters?: any, scale?: number, position?: { x: number, y: number }) => void;
    applyGlobalFilters: (filters: any) => void;
    applyGlobalBackgroundTransform: (scale: number, position: { x: number, y: number }) => void;
    addGlobalLogo: (imageSrc: string) => void;
    updateSlide: (slideId: string, updates: Partial<Slide>) => void;
    deleteSlide: (id: string) => void;
    addSlideAtIndex: (index: number) => void;
    // V3 Branding
    applyGlobalBackgroundColor: (color: string) => void;
    applyGlobalTextColor: (color: string) => void;
    applyGlobalHeadingSize: (size: number) => void;
    applyGlobalContentSize: (size: number) => void;
    deleteElement: (slideId: string, elementId: string) => void;
    applyBranding: (name: string, handle: string, avatarSrc: string) => void;
    updateSlideThumbnail: (id: string, thumbnail: string) => void;
    setEditingElement: (id: string | null) => void;
    saveCheckpoint: () => void;
    undo: () => void;
    redo: () => void;
}

const INITIAL_PROJECT: Project = {
    id: uuidv4(),
    version: 2,
    title: 'Untitled Project',
    slides: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    aspectRatio: AspectRatio.RATIO_1_1,
    theme: 'default'
};

export const useEditorStore = create<EditorState>()(
    devtools(
        immer((set, get, store) => ({
            // --- SLICES ---
            ...createSelectionSlice(set as any, get as any, store as any),

            // --- DATA ---
            project: INITIAL_PROJECT,
            activeSlideId: null,
            editingElementId: null,
            past: [],
            future: [],

            // --- INTERNAL HELPERS ---
            saveCheckpoint: () => {
                const state = get();
                // Deep clone the project to avoid reference issues in history
                // We use structuredClone if available or JSON parse/stringify for simplicity here
                const projectClone = JSON.parse(JSON.stringify(state.project));
                set((s) => {
                    s.past.push(projectClone);
                    if (s.past.length > 50) s.past.shift(); // Max 50 undos
                    s.future = []; // Clear redo stack on new action
                });
            },

            // --- ACTIONS ---
            setProject: (project) => set({ project, activeSlideId: project.slides[0]?.id || null, past: [], future: [] }),

            setEditingElement: (id) => set({ editingElementId: id }),

            addSlide: () => {
                get().saveCheckpoint();
                set((state) => {
                    const newSlide: Slide = {
                        id: uuidv4(),
                        order: state.project.slides.length,
                        elements: [],
                        backgroundColor: '#ffffff',
                        backgroundFilters: { blur: 0, brightness: 0, contrast: 0, saturation: 0 }
                    };
                    state.project.slides.push(newSlide);
                    state.activeSlideId = newSlide.id;
                    state.project.updatedAt = Date.now();
                });
            },

            setActiveSlide: (id) => set({ activeSlideId: id }),

            updateElement: (slideId, elementId, updates) => {
                // Not saving checkpoint for every update (too noisy for drag/resize)
                // In a production app, we'd debounce or save on 'dragEnd'
                set((state) => {
                    const slide = state.project.slides.find(s => s.id === slideId);
                    if (!slide) return;
                    const elIndex = slide.elements.findIndex(e => e.id === elementId);
                    if (elIndex !== -1) {
                        Object.assign(slide.elements[elIndex], updates);
                        state.project.updatedAt = Date.now();
                    }
                });
            },

            addElement: (slideId, element) => {
                get().saveCheckpoint();
                set((state) => {
                    const slide = state.project.slides.find(s => s.id === slideId);
                    if (slide) {
                        slide.elements.push(element);
                        state.project.updatedAt = Date.now();
                    }
                });
            },

            applyGlobalBackground: (image, filters, scale = 1, position = { x: 0, y: 0 }) => {
                get().saveCheckpoint();
                set((state) => {
                    // Ensure we update all slides
                    state.project.slides.forEach(slide => {
                        slide.backgroundImage = image;
                        if (filters) {
                            slide.backgroundFilters = { ...filters };
                        }
                        slide.backgroundScale = scale;
                        slide.backgroundPosition = position;
                    });
                    state.project.updatedAt = Date.now(); // Trigger re-render
                });
            },

            applyGlobalBackgroundTransform: (scale, position) => {
                set((state) => {
                    state.project.slides.forEach(slide => {
                        slide.backgroundScale = scale;
                        slide.backgroundPosition = position;
                    });
                    state.project.updatedAt = Date.now();
                });
            },

            updateSlideThumbnail: (id, thumbnail) => {
                set((state) => {
                    const slide = state.project.slides.find(s => s.id === id);
                    if (slide) {
                        slide.thumbnail = thumbnail;
                    }
                });
            },

            applyGlobalFilters: (filters) => {
                get().saveCheckpoint();
                set((state) => {
                    state.project.slides.forEach(slide => {
                        slide.backgroundFilters = filters;
                    });
                    state.project.updatedAt = Date.now();
                });
            },

            addGlobalLogo: (src) => {
                get().saveCheckpoint();
                set((state) => {
                    // Add logo to bottom right of every slide
                    // Assuming 1080px base
                    // Logo size 150x150, padding 50
                    state.project.slides.forEach(slide => {
                        const logo: CanvasElement = {
                            id: uuidv4(),
                            type: 'image' as any, // Cast to avoid import cycle or ElementType
                            src: src,
                            x: 1080 - 150 - 40,
                            y: 1080 - 150 - 40, // TODO: This needs to depend on aspect ratio height! 
                            // But for now hardcoded to 1080 base.
                            // Ideally we check project.aspectRatio
                            width: 150,
                            height: 150,
                            rotation: 0,
                            opacity: 1,
                            locked: true,
                            zIndex: 100, // Top
                            maintainAspectRatio: true
                        } as any;

                        // Simple Y adjustment for Aspect Ratios
                        if (state.project.aspectRatio === '16:9') logo.y = 608 - 150 - 40;
                        if (state.project.aspectRatio === '4:5') logo.y = 1350 - 150 - 40;

                        slide.elements.push(logo);
                    });
                    state.project.updatedAt = Date.now();
                });
            },

            updateSlide: (slideId, updates) => {
                // Checkpoint only if significantly changing
                set((state) => {
                    const slide = state.project.slides.find(s => s.id === slideId);
                    if (slide) {
                        Object.assign(slide, updates);
                        state.project.updatedAt = Date.now();
                    }
                });
            },

            applyGlobalBackgroundColor: (color) => {
                get().saveCheckpoint();
                set((state) => {
                    state.project.slides.forEach(slide => {
                        slide.backgroundColor = color;
                    });
                    state.project.updatedAt = Date.now();
                });
            },

            applyGlobalTextColor: (color) => {
                get().saveCheckpoint();
                set((state) => {
                    // Find all text elements and update fill
                    state.project.slides.forEach(slide => {
                        slide.elements.forEach(el => {
                            if (el.type === 'text') { // Cast check?
                                (el as any).fill = color;
                            }
                        });
                    });
                    state.project.updatedAt = Date.now();
                });
            },

            applyGlobalHeadingSize: (size = 69) => {
                get().saveCheckpoint();
                set((state) => {
                    state.project.slides.forEach(slide => {
                        slide.elements.forEach(el => {
                            if (el.type === 'text' && (el as any).fontSize > 60) {
                                (el as any).fontSize = size;
                            }
                        });
                    });
                    state.project.updatedAt = Date.now();
                });
            },

            applyGlobalContentSize: (size = 54) => {
                get().saveCheckpoint();
                set((state) => {
                    state.project.slides.forEach(slide => {
                        slide.elements.forEach(el => {
                            if (el.type === 'text' && (el as any).fontSize <= 60) {
                                (el as any).fontSize = size;
                            }
                        });
                    });
                    state.project.updatedAt = Date.now();
                });
            },

            deleteSlide: (id) => {
                get().saveCheckpoint();
                set((state) => {
                    const index = state.project.slides.findIndex(s => s.id === id);
                    if (index !== -1) {
                        state.project.slides.splice(index, 1);
                        // Update activeSlideId if the deleted slide was active
                        if (state.activeSlideId === id) {
                            const nextIndex = Math.min(index, state.project.slides.length - 1);
                            state.activeSlideId = state.project.slides[nextIndex]?.id || null;
                        }
                        // Clean up selection
                        state.selectedIds = [];
                        state.project.updatedAt = Date.now();
                    }
                });
            },

            addSlideAtIndex: (index) => {
                get().saveCheckpoint();
                set((state) => {
                    const newSlide: Slide = {
                        id: uuidv4(),
                        order: index, // This order property might need a global re-index if used for sorting
                        elements: [],
                        backgroundColor: '#ffffff',
                        backgroundFilters: { blur: 0, brightness: 0, contrast: 0, saturation: 0 }
                    };
                    state.project.slides.splice(index, 0, newSlide);
                    state.activeSlideId = newSlide.id;
                    state.project.updatedAt = Date.now();
                });
            },

            deleteElement: (slideId, elementId) => {
                get().saveCheckpoint();
                set((state) => {
                    const slide = state.project.slides.find(s => s.id === slideId);
                    if (slide) {
                        slide.elements = slide.elements.filter(el => el.id !== elementId);
                        state.selectedIds = state.selectedIds.filter(id => id !== elementId);
                        state.project.updatedAt = Date.now();
                    }
                });
            },

            applyBranding: (name, handle, avatarSrc) => {
                get().saveCheckpoint();
                set((state) => {
                    const pRatio = state.project.aspectRatio;
                    let baseY = 1080 - 100; // default for 1:1
                    if (pRatio === '16:9') baseY = 608 - 80;
                    if (pRatio === '4:5') baseY = 1350 - 100;

                    state.project.slides.forEach(slide => {
                        // 0. Remove existing branding elements
                        slide.elements = slide.elements.filter(el => !el.metadata?.isBranding);

                        // 1. Avatar
                        if (avatarSrc) {
                            const avatar: CanvasElement = {
                                id: uuidv4(),
                                type: 'image' as any,
                                src: avatarSrc,
                                x: 40,
                                y: baseY,
                                width: 80,
                                height: 80,
                                rotation: 0,
                                opacity: 1,
                                locked: true,
                                zIndex: 200,
                                maintainAspectRatio: true,
                                metadata: { isBranding: true },
                                // Circular crop? Konva Image doesn't do circle crop easily without Group or fillPattern.
                                // For V3 we assume square or pre-cropped.
                            } as any;
                            slide.elements.push(avatar);
                        }

                        // 2. Handle / Name
                        const textContent = `${name} | ${handle}`;
                        const brandingText: CanvasElement = {
                            id: uuidv4(),
                            type: 'text' as any,
                            content: textContent,
                            x: 140, // offset from avatar
                            y: baseY + 25,
                            width: 500,
                            height: 50,
                            fontSize: 24,
                            fontFamily: 'Inter',
                            fontWait: 'bold',
                            fill: '#ffffff', // Default white, maybe contrast?
                            align: 'left',
                            verticalAlign: 'middle',
                            rotation: 0,
                            opacity: 1,
                            locked: true,
                            zIndex: 200,
                            autoWidth: true,
                            autoHeight: true,
                            metadata: { isBranding: true },
                        } as any;
                        slide.elements.push(brandingText);
                    });
                    state.project.updatedAt = Date.now();
                });
            },

            undo: () => {
                const state = get();
                if (state.past.length === 0) return;

                const previous = state.past[state.past.length - 1];
                const currentClone = JSON.parse(JSON.stringify(state.project));

                set((s) => {
                    s.future.push(currentClone);
                    s.project = previous;
                    s.past = state.past.slice(0, -1);
                    s.activeSlideId = previous.slides[0]?.id || null;
                });
            },

            redo: () => {
                const state = get();
                if (state.future.length === 0) return;

                const next = state.future[state.future.length - 1];
                const currentClone = JSON.parse(JSON.stringify(state.project));

                set((s) => {
                    s.past.push(currentClone);
                    s.project = next;
                    s.future = state.future.slice(0, -1);
                    s.activeSlideId = next.slides[0]?.id || null;
                });
            }
        }))
    )
);
