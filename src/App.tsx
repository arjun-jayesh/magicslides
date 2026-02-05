import { useState, useEffect } from 'react';
import { CanvasStage } from './features/canvas/CanvasStage';
import { Toolbar } from './components/shell/Toolbar';
import { AIPanel } from './components/shell/AIPanel';
import { Inspector } from './components/shell/Inspector';
import { useEditorStore } from './store/useEditorStore';
import { SlideFilmstrip } from './components/shell/SlideFilmstrip';
import { AccessGuard } from './components/auth/AccessGuard';
import { useIsMobile } from './hooks/useMediaQuery';
import { Sparkles, Layout, Settings2 } from 'lucide-react';

type MobileDrawer = 'ai' | 'inspector' | null;

function App() {
  const { activeSlideId, addSlide } = useEditorStore();
  const isMobile = useIsMobile();
  const [activeDrawer, setActiveDrawer] = useState<MobileDrawer>(null);

  // Initialize
  useEffect(() => {
    if (!activeSlideId) addSlide();
  }, [activeSlideId, addSlide]);

  const renderMainContent = () => {
    if (!isMobile) {
      return (
        <div className="flex-1 flex relative overflow-hidden">
          <AIPanel />
          <div className="flex-1 flex flex-col min-w-0 bg-gray-900 border-x border-gray-800">
            <SlideFilmstrip />
            <div className="flex-1 flex items-center justify-center overflow-auto p-8 relative">
              <CanvasStage />
            </div>
          </div>
          <Inspector />
        </div>
      );
    }

    // Mobile View with Overlays
    return (
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Background Content (Always Visible) */}
        <div className="flex-1 flex flex-col min-w-0 bg-gray-900 h-full overflow-hidden">
          <SlideFilmstrip />
          <div className="flex-1 flex items-center justify-center overflow-auto p-4 relative">
            <CanvasStage />
          </div>
        </div>

        {/* Overlay Drawers */}
        {activeDrawer === 'ai' && (
          <div className="absolute inset-0 z-40 bg-black/60 backdrop-blur-sm flex">
            <div className="flex-1 h-full max-w-[85%] animate-in slide-in-from-left duration-200">
              <AIPanel onClose={() => setActiveDrawer(null)} />
            </div>
            <div className="flex-1 h-full" onClick={() => setActiveDrawer(null)} />
          </div>
        )}

        {activeDrawer === 'inspector' && (
          <div className="absolute inset-0 z-40 bg-black/60 backdrop-blur-sm flex justify-end">
            <div className="flex-1 h-full" onClick={() => setActiveDrawer(null)} />
            <div className="flex-1 h-full max-w-[85%] animate-in slide-in-from-right duration-200">
              <Inspector onClose={() => setActiveDrawer(null)} />
            </div>
          </div>
        )}

        {/* Mobile Bottom Nav */}
        <div className="h-16 bg-gray-950 border-t border-white/10 flex items-center justify-around px-2 z-50">
          <button
            onClick={() => setActiveDrawer(activeDrawer === 'ai' ? null : 'ai')}
            className={`flex flex-col items-center gap-1 transition-colors ${activeDrawer === 'ai' ? 'text-blue-500' : 'text-gray-400'}`}
          >
            <Sparkles size={22} />
            <span className="text-[10px] font-bold uppercase tracking-tight">AI Panel</span>
          </button>

          <button
            onClick={() => setActiveDrawer(null)}
            className={`flex flex-col items-center gap-1 transition-colors ${activeDrawer === null ? 'text-blue-500' : 'text-gray-400'}`}
          >
            <Layout size={22} />
            <span className="text-[10px] font-bold uppercase tracking-tight">Canvas</span>
          </button>

          <button
            onClick={() => setActiveDrawer(activeDrawer === 'inspector' ? null : 'inspector')}
            className={`flex flex-col items-center gap-1 transition-colors ${activeDrawer === 'inspector' ? 'text-blue-500' : 'text-gray-400'}`}
          >
            <Settings2 size={22} />
            <span className="text-[10px] font-bold uppercase tracking-tight">Settings</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <AccessGuard>
      <div className="w-full h-screen h-[100dvh] flex flex-col bg-gray-950 text-white overflow-hidden">
        <Toolbar />
        {renderMainContent()}
      </div>
    </AccessGuard>
  );
}

export default App;
