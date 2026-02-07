import React, { useState } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { Trash2, Plus, Check, X } from 'lucide-react';
import { useIsMobile } from '@/hooks/useMediaQuery';

export const SlideFilmstrip: React.FC = () => {
    const isMobile = useIsMobile();
    const { project, activeSlideId, setActiveSlide, deleteSlide, addSlideAtIndex } = useEditorStore();
    const [confirmId, setConfirmId] = useState<string | null>(null);

    return (
        <div className={`${isMobile ? 'h-20 px-2 shadow-none border-b-0' : 'h-28 px-6 shadow-inner'} bg-gray-900 border-b border-gray-700 flex items-center overflow-x-auto scrollbar-hide py-2 transition-all`}>
            <div className="flex items-center space-x-2">
                {/* Initial Add Button */}
                {!isMobile && (
                    <button
                        onClick={() => addSlideAtIndex(0)}
                        className="flex-shrink-0 w-8 h-20 rounded bg-gray-800/50 hover:bg-blue-600/30 border border-dashed border-gray-600 hover:border-blue-500 transition-all group"
                        title="Add slide at beginning"
                    >
                        <Plus className="w-4 h-4 mx-auto text-gray-500 group-hover:text-blue-400" />
                    </button>
                )}

                {project.slides.map((slide, index) => {
                    const isActive = slide.id === activeSlideId;
                    const isConfirming = confirmId === slide.id;

                    return (
                        <React.Fragment key={slide.id}>
                            <div
                                onClick={() => setActiveSlide(slide.id)}
                                className={`
                                    group relative flex-shrink-0 ${isMobile ? 'w-28 h-14' : 'w-36 h-20'} rounded-lg cursor-pointer transition-all duration-200
                                    ${isActive ? 'ring-2 ring-blue-500 scale-102 shadow-lg shadow-blue-500/20' : 'hover:bg-gray-800 opacity-80 hover:opacity-100 border border-gray-700'}
                                `}
                                style={{ backgroundColor: slide.backgroundColor }}
                            >
                                {/* Thumbnail Content */}
                                {(slide.thumbnail || slide.backgroundImage) ? (
                                    <img
                                        src={slide.thumbnail || slide.backgroundImage}
                                        className="w-full h-full object-cover rounded-lg"
                                        alt={`Slide ${index + 1}`}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-600 text-[10px] font-mono uppercase tracking-widest">
                                        Empty
                                    </div>
                                )}

                                {/* Slide Number Badge */}
                                <div className="absolute top-1.5 left-1.5 bg-black/60 backdrop-blur-sm text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md border border-white/10">
                                    {index + 1}
                                </div>

                                {/* Deletion Actions Overlay */}
                                <div className={`
                                    absolute inset-0 rounded-lg flex items-center justify-center gap-2 transition-all duration-200
                                    ${isConfirming ? 'bg-red-950/90 opacity-100 z-20' : 'bg-black/40 opacity-0 group-hover:opacity-100 z-10 pointer-events-none group-hover:pointer-events-auto'}
                                `}>
                                    {isConfirming ? (
                                        <>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); deleteSlide(slide.id); setConfirmId(null); }}
                                                className="p-1.5 bg-red-600 text-white rounded-full hover:bg-red-500 transition-colors shadow-lg"
                                                title="Confirm Delete"
                                            >
                                                <Check className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setConfirmId(null); }}
                                                className="p-1.5 bg-gray-600 text-white rounded-full hover:bg-gray-500 transition-colors shadow-lg"
                                                title="Cancel"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setConfirmId(slide.id); }}
                                            className="p-2 bg-red-600/80 text-white rounded-full hover:bg-red-500 transition-colors shadow-lg border border-red-400/50"
                                            title="Delete Slide"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Insertion Button Between Slides */}
                            <button
                                onClick={() => addSlideAtIndex(index + 1)}
                                className="flex-shrink-0 w-6 h-12 rounded-full hover:bg-blue-600/40 opacity-0 hover:opacity-100 transition-all flex items-center justify-center group"
                                title="Insert slide here"
                            >
                                <Plus className="w-4 h-4 text-blue-400 scale-0 group-hover:scale-100 transition-transform" />
                            </button>
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
};
