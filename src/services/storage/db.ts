import Dexie, { Table } from 'dexie';
import { Project } from '@/models/types';

export class MagicSlideDB extends Dexie {
    projects!: Table<Project, string>;

    constructor() {
        super('magicslides_db');
        this.version(1).stores({
            projects: 'id, updatedAt'
        });
    }
}

export const db = new MagicSlideDB();

export const saveProject = async (project: Project) => {
    await db.projects.put(project);
};

export const loadProject = async (id: string) => {
    return await db.projects.get(id);
};
