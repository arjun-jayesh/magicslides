import { useRef } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { ExportManager } from '@/features/export/exportManager';
import { PersistenceManager } from '@/features/persistence/persistenceManager';
import { Undo2, Redo2, Save, Upload, Download, Plus } from 'lucide-react';
import { useIsMobile } from '@/hooks/useMediaQuery';

export const Toolbar = () => {
    const isMobile = useIsMobile();
    const { project, addSlide, setProject } = useEditorStore();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSave = () => {
        PersistenceManager.saveProject(project);
    };

    const handleLoad = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            PersistenceManager.loadProject(file)
                .then(loadedProject => {
                    setProject(loadedProject);
                    alert("Project Loaded Successfully!");
                })
                .catch(err => alert("Failed to load project: " + err));
        }
    };

    const handleExport = () => {
        ExportManager.exportProject(project);
    };

    return (
        <div className="h-16 bg-gray-900 border-b border-gray-700 flex items-center px-4 justify-between">
            <h1 className={`${isMobile ? 'text-sm' : 'text-xl'} font-bold text-white whitespace-nowrap`}>
                {isMobile ? 'Magic' : 'Magic Slide'}
            </h1>
            <div className="flex gap-2 items-center">
                <input
                    type="file"
                    ref={fileInputRef}
                    accept=".magic,.json"
                    hidden
                    onChange={handleLoad}
                />

                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 bg-gray-700 text-white rounded hover:bg-gray-600 flex items-center gap-2"
                    title="Load Project"
                >
                    <Upload size={16} />
                    {!isMobile && <span className="text-xs">Load</span>}
                </button>

                <div className="flex bg-gray-800 rounded p-1">
                    <button
                        onClick={() => useEditorStore.getState().undo()}
                        className="p-1 px-2 hover:bg-gray-700 text-white rounded transition-colors disabled:opacity-30"
                        title="Undo (Ctrl+Z)"
                    >
                        <Undo2 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => useEditorStore.getState().redo()}
                        className="p-1 px-2 hover:bg-gray-700 text-white rounded transition-colors disabled:opacity-30"
                        title="Redo (Ctrl+Y)"
                    >
                        <Redo2 className="w-4 h-4" />
                    </button>
                </div>

                <button
                    onClick={addSlide}
                    className="p-2 bg-blue-600 text-white rounded hover:bg-blue-500 flex items-center gap-2"
                    title="Add Slide"
                >
                    <Plus size={16} />
                    {!isMobile && <span className="text-xs">Add Slide</span>}
                </button>

                <button
                    onClick={handleSave}
                    className="p-2 bg-green-600 text-white rounded hover:bg-green-500 flex items-center gap-2"
                    title="Save .magic"
                >
                    <Save size={16} />
                    {!isMobile && <span className="text-xs">Save</span>}
                </button>

                <button
                    onClick={handleExport}
                    className="p-2 bg-purple-600 text-white rounded hover:bg-purple-500 flex items-center gap-2"
                    title="Export ZIP"
                >
                    <Download size={16} />
                    {!isMobile && <span className="text-xs">Export</span>}
                </button>
            </div>
        </div>
    );
};
