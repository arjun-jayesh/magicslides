import { useEffect } from 'react';
import { CanvasStage } from './features/canvas/CanvasStage';
import { Toolbar } from './components/shell/Toolbar';
import { AIPanel } from './components/shell/AIPanel';
import { Inspector } from './components/shell/Inspector';
import { useEditorStore } from './store/useEditorStore';
import { SlideFilmstrip } from './components/shell/SlideFilmstrip';
import { AccessGuard } from './components/auth/AccessGuard';

function App() {
  const { activeSlideId, addSlide } = useEditorStore();

  // Initialize
  useEffect(() => {
    if (!activeSlideId) addSlide();
  }, [activeSlideId, addSlide]);

  return (
    <AccessGuard>
      <div className="w-full h-screen flex flex-col bg-gray-950 text-white overflow-hidden">
        <Toolbar />
        <div className="flex-1 flex relative overflow-hidden">
          <AIPanel />

          {/* Center Area: Filmstrip + Canvas */}
          <div className="flex-1 flex flex-col min-w-0 bg-gray-900 border-x border-gray-800">
            <SlideFilmstrip />
            <div className="flex-1 flex items-center justify-center overflow-auto p-8 relative">
              <CanvasStage />
            </div>
          </div>

          <Inspector />
        </div>
      </div>
    </AccessGuard>
  );
}

export default App;
