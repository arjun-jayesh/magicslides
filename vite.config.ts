import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        port: 3000,
        host: '0.0.0.0', // Listen on all ips
        watch: {
            usePolling: true, // Fix for some FS events not triggering
        },
        hmr: {
            host: 'localhost',
            port: 3000
        },
        proxy: {
            '/ai-api': {
                target: 'http://localhost:8080',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/ai-api/, '')
            }
        }
    },
    build: {
        outDir: 'dist',
        sourcemap: true,
    },
});
