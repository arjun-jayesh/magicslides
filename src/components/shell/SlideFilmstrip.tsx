import React from 'react';
import { useEditorStore } from '@/store/useEditorStore';

export const SlideFilmstrip: React.FC = () => {
    const { project, activeSlideId, setActiveSlide } = useEditorStore();

    return (
        <div className="h-24 bg-gray-900 border-b border-gray-700 flex items-center px-4 space-x-4 overflow-x-auto">
            {project.slides.map((slide, index) => {
                const isActive = slide.id === activeSlideId;
                return (
                    <div
                        key={slide.id}
                        onClick={() => setActiveSlide(slide.id)}
                        className={`
                            relative flex-shrink-0 w-32 h-20 rounded cursor-pointer transition-all
                            ${isActive ? 'ring-2 ring-blue-500 scale-105' : 'hover:bg-gray-800 opacity-80 hover:opacity-100'}
                        `}
                        style={{ backgroundColor: slide.backgroundColor }}
                    >
                        {/* Thumbnail Content */}
                        {(slide.thumbnail || slide.backgroundImage) && (
                            <img
                                src={slide.thumbnail || slide.backgroundImage}
                                className="w-full h-full object-cover rounded"
                                alt={`Slide ${index + 1}`}
                            />
                        )}

                        {/* Slide Number Badge */}
                        <div className="absolute top-1 left-1 bg-black/50 text-white text-[10px] px-1.5 rounded">
                            {index + 1}
                        </div>
                    </div>
                );
            })}

            {/* Add Slide Button Placeholder (optional, keeping it simple for now) */}
        </div>
    );
};
