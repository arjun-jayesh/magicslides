import React, { useState, useRef } from 'react';
import { AIService } from '@/services/ai/aiService';
import { buildPrompt, SYSTEM_PROMPT } from '@/services/ai/prompts';
import { ResponseParser } from '@/core/parser/responseParser';
import { ContentMapper } from '@/core/bridge/ContentMapper';
import { useEditorStore } from '@/store/useEditorStore';
import { useToast } from '@/components/ui/ToastProvider';
import { useIsMobile } from '@/hooks/useMediaQuery';

import { PresetManager } from '../../features/presets/PresetManager';

type Tab = 'content' | 'design' | 'branding' | 'colors';

export const AIPanel = () => {
    const isMobile = useIsMobile();
    const [activeTab, setActiveTab] = useState<Tab>('content');

    // Content State
    const [topic, setTopic] = useState('');
    const [count, setCount] = useState(5);
    const [tone, setTone] = useState<string>('Professional');
    const [style, setStyle] = useState('');
    const [loading, setLoading] = useState(false);

    // Branding State
    const [brandName, setBrandName] = useState('');
    const [handle, setHandle] = useState('');
    const [avatarSrc, setAvatarSrc] = useState<string>('');
    const avatarInputRef = useRef<HTMLInputElement>(null);

    // Colors State
    // Using simple hex inputs for now
    const [bgColor, setBgColor] = useState('#ffffff');
    const [textColor, setTextColor] = useState('#000000');

    const { setProject, applyBranding, applyGlobalBackgroundColor, applyGlobalTextColor } = useEditorStore();
    const { showToast } = useToast();

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const userPrompt = buildPrompt({
                topic,
                count,
                tone,
                style
            });

            const raw = await AIService.generate({
                systemPrompt: SYSTEM_PROMPT,
                userPrompt,
                temperature: 0.7
            });

            const parsed = ResponseParser.parse(raw);
            const project = ContentMapper.createProjectFromAI(parsed);

            setProject(project);
            showToast('Carousel generated successfully!', 'success');
        } catch (e) {
            showToast('AI Generation Failed: ' + e, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                setAvatarSrc(ev.target?.result as string);
                showToast('Avatar uploaded', 'success');
            };
            reader.readAsDataURL(file);
        }
    };

    const handleApplyBranding = () => {
        if (!brandName || !handle) {
            showToast("Please enter Name and Handle", 'error');
            return;
        }
        applyBranding(brandName, handle, avatarSrc);
        showToast("Branding applied to all slides!", 'success');
    };

    const handleApplyColors = () => {
        applyGlobalBackgroundColor(bgColor);
        applyGlobalTextColor(textColor);
        showToast("Colors applied!", 'success');
    };

    return (
        <div className={`${isMobile ? 'flex-1 w-full' : 'w-80'} bg-gray-900 border-r border-gray-700 flex flex-col overflow-hidden`}>
            {/* Tabs Header */}
            <div className="flex border-b border-gray-700">
                <button
                    onClick={() => setActiveTab('content')}
                    className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider ${activeTab === 'content' ? 'bg-gray-800 text-blue-400 border-b-2 border-blue-400' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    Content
                </button>
                <button
                    onClick={() => setActiveTab('design')}
                    className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider ${activeTab === 'design' ? 'bg-gray-800 text-yellow-400 border-b-2 border-yellow-400' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    Design
                </button>
                <button
                    onClick={() => setActiveTab('branding')}
                    className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider ${activeTab === 'branding' ? 'bg-gray-800 text-purple-400 border-b-2 border-purple-400' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    Branding
                </button>
                <button
                    onClick={() => setActiveTab('colors')}
                    className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider ${activeTab === 'colors' ? 'bg-gray-800 text-green-400 border-b-2 border-green-400' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    Colors
                </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">

                {/* --- CONTENT TAB --- */}
                {activeTab === 'content' && (
                    <div className="space-y-6">
                        <div className="bg-blue-900/20 p-3 rounded border border-blue-800/50">
                            <h2 className="text-sm font-bold text-blue-400 mb-1">AI Generator</h2>
                            <p className="text-[10px] text-gray-400">Generate high-accuracy carousels.</p>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-400 mb-1">TOPIC</label>
                            <textarea
                                className="w-full h-24 bg-gray-800 border border-gray-600 rounded p-2 text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                placeholder="e.g. 5 Tips for Better Sleep"
                                value={topic}
                                onChange={e => setTopic(e.target.value)}
                            />
                        </div>

                        <div>
                            <div className="flex justify-between mb-1">
                                <label className="block text-xs font-semibold text-gray-400">LENGTH</label>
                                <span className="text-xs font-bold text-blue-400">{count} Slides</span>
                            </div>
                            <input
                                type="range" min="3" max="10"
                                value={count}
                                onChange={e => setCount(parseInt(e.target.value))}
                                className="w-full accent-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-400 mb-1">TONE</label>
                            <select
                                value={tone}
                                onChange={e => setTone(e.target.value)}
                                className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-sm text-white focus:outline-none"
                            >
                                <option>Professional</option>
                                <option>Casual</option>
                                <option>Viral / Hook-heavy</option>
                                <option>Educational</option>
                                <option>Storytelling</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-400 mb-1">EXTRA INSTRUCTIONS</label>
                            <textarea
                                className="w-full h-16 bg-gray-800 border border-gray-600 rounded p-2 text-white text-xs focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                placeholder="Specific style rules..."
                                value={style}
                                onChange={e => setStyle(e.target.value)}
                            />
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={loading || !topic}
                            className={`w-full py-3 rounded font-bold text-white transition-all shadow-lg ${loading ? 'bg-gray-600 cursor-wait' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500'
                                }`}
                        >
                            {loading ? 'Generating Magic...' : '✨ Generate Carousel'}
                        </button>
                    </div>
                )}

                {/* --- DESIGN TAB --- */}
                {activeTab === 'design' && (
                    <div className="space-y-6">
                        <PresetManager />
                    </div>
                )}

                {/* --- BRANDING TAB --- */}
                {activeTab === 'branding' && (
                    <div className="space-y-6">
                        <div className="bg-purple-900/20 p-3 rounded border border-purple-800/50">
                            <h2 className="text-sm font-bold text-purple-400 mb-1">Identity</h2>
                            <p className="text-[10px] text-gray-400">Add your logo and handle to every slide.</p>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-400 mb-1">NAME</label>
                            <input
                                type="text"
                                className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-white text-sm"
                                placeholder="Your Name"
                                value={brandName}
                                onChange={e => setBrandName(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-400 mb-1">HANDLE</label>
                            <input
                                type="text"
                                className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-white text-sm"
                                placeholder="@username"
                                value={handle}
                                onChange={e => setHandle(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-400 mb-1">AVATAR</label>
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center overflow-hidden border border-gray-600">
                                    {avatarSrc ? (
                                        <img src={avatarSrc} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-gray-600 text-xs">IMG</span>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    hidden
                                    ref={avatarInputRef}
                                    onChange={handleAvatarUpload}
                                />
                                <button
                                    onClick={() => avatarInputRef.current?.click()}
                                    className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded"
                                >
                                    Upload
                                </button>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-800">
                            <button
                                onClick={handleApplyBranding}
                                className="w-full py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded font-bold text-white text-sm"
                            >
                                Apply Branding
                            </button>
                        </div>
                    </div>
                )}

                {/* --- COLORS TAB --- */}
                {activeTab === 'colors' && (
                    <div className="space-y-6">
                        <div className="bg-green-900/20 p-3 rounded border border-green-800/50">
                            <h2 className="text-sm font-bold text-green-400 mb-1">Global Theme</h2>
                            <p className="text-[10px] text-gray-400">Override colors across the entire project.</p>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-400 mb-1">BACKGROUND COLOR</label>
                            <div className="flex space-x-2">
                                <input
                                    type="color"
                                    value={bgColor}
                                    onChange={e => setBgColor(e.target.value)}
                                    className="h-10 w-10 bg-transparent border-none cursor-pointer"
                                />
                                <input
                                    type="text"
                                    value={bgColor}
                                    onChange={e => setBgColor(e.target.value)}
                                    className="flex-1 bg-gray-800 border border-gray-600 rounded p-2 text-white font-mono text-sm uppercase"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-400 mb-1">TEXT COLOR</label>
                            <div className="flex space-x-2">
                                <input
                                    type="color"
                                    value={textColor}
                                    onChange={e => setTextColor(e.target.value)}
                                    className="h-10 w-10 bg-transparent border-none cursor-pointer"
                                />
                                <input
                                    type="text"
                                    value={textColor}
                                    onChange={e => setTextColor(e.target.value)}
                                    className="flex-1 bg-gray-800 border border-gray-600 rounded p-2 text-white font-mono text-sm uppercase"
                                />
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-800">
                            <button
                                onClick={handleApplyColors}
                                className="w-full py-2 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-500 hover:to-teal-500 rounded font-bold text-white text-sm"
                            >
                                Apply Colors
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};
