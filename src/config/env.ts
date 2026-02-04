import { z } from 'zod';

const envSchema = z.object({
    // Add environment variables here as needed
    // VITE_API_URL: z.string().url().optional(),
    MODE: z.enum(['development', 'production', 'test']),
    DEV: z.boolean(),
    PROD: z.boolean(),
    SSR: z.boolean(),
});

export const env = envSchema.parse({
    MODE: import.meta.env.MODE,
    DEV: import.meta.env.DEV,
    PROD: import.meta.env.PROD,
    SSR: import.meta.env.SSR,
});
