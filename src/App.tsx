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

type MobileView = 'ai' | 'canvas' | 'inspector';

function App() {
  const { activeSlideId, addSlide } = useEditorStore();
  const isMobile = useIsMobile();
  const [mobileView, setMobileView] = useState<MobileView>('canvas');

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

    // Mobile View Switching
    return (
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {mobileView === 'ai' && <AIPanel />}
        {mobileView === 'inspector' && <Inspector />}
        {mobileView === 'canvas' && (
          <div className="flex-1 flex flex-col min-w-0 bg-gray-900">
            <SlideFilmstrip />
            <div className="flex-1 flex items-center justify-center overflow-auto p-4 relative">
              <CanvasStage />
            </div>
          </div>
        )}

        {/* Mobile Bottom Nav */}
        <div className="h-16 bg-gray-900 border-t border-gray-800 flex items-center justify-around px-2">
          <button
            onClick={() => setMobileView('ai')}
            className={`flex flex-col items-center gap-1 transition-colors ${mobileView === 'ai' ? 'text-blue-500' : 'text-gray-500'}`}
          >
            <Sparkles size={20} />
            <span className="text-[10px] font-bold uppercase">AI</span>
          </button>
          <button
            onClick={() => setMobileView('canvas')}
            className={`flex flex-col items-center gap-1 transition-colors ${mobileView === 'canvas' ? 'text-blue-500' : 'text-gray-500'}`}
          >
            <Layout size={20} />
            <span className="text-[10px] font-bold uppercase">Canvas</span>
          </button>
          <button
            onClick={() => setMobileView('inspector')}
            className={`flex flex-col items-center gap-1 transition-colors ${mobileView === 'inspector' ? 'text-blue-500' : 'text-gray-500'}`}
          >
            <Settings2 size={20} />
            <span className="text-[10px] font-bold uppercase">Settings</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <AccessGuard>
      <div className="w-full h-screen flex flex-col bg-gray-950 text-white overflow-hidden">
        <Toolbar />
        {renderMainContent()}
      </div>
    </AccessGuard>
  );
}

export default App;
