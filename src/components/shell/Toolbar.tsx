import { useRef } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { ExportManager } from '@/features/export/exportManager';
import { PersistenceManager } from '@/features/persistence/persistenceManager';
import { Undo2, Redo2 } from 'lucide-react';

export const Toolbar = () => {
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
            <h1 className="text-xl font-bold text-white">Magic Slide</h1>
            <div className="flex gap-2">
                <input
                    type="file"
                    ref={fileInputRef}
                    accept=".magic,.json"
                    hidden
                    onChange={handleLoad}
                />

                <button onClick={() => fileInputRef.current?.click()} className="px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-600">
                    Load
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

                <button onClick={addSlide} className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-500">
                    Add Slide
                </button>

                <button onClick={handleSave} className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-500">
                    Save .magic
                </button>

                <button onClick={handleExport} className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-500">
                    Export ZIP
                </button>
            </div>
        </div>
    );
};
