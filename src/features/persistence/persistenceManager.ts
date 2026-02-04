import { Project } from '@/models/types';

export class PersistenceManager {
    static saveProject(project: Project) {
        // Strip sensitive or large runtime content if needed? 
        // For now, full dump is fine.
        const data = JSON.stringify(project, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `${project.title.replace(/\s+/g, '_')}.magic`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    static loadProject(file: File): Promise<Project> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const result = e.target?.result as string;
                    const project = JSON.parse(result) as Project;
                    // TODO: Validate schema?
                    if (!project.id || !project.slides) {
                        throw new Error("Invalid Magic File");
                    }
                    resolve(project);
                } catch (err) {
                    reject(err);
                }
            };
            reader.onerror = reject;
            reader.readAsText(file);
        });
    }
}
