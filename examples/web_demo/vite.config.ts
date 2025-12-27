import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import path from 'path';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        react(),
        nodePolyfills({
            protocolImports: true,
        }),
    ],
    base: './',
    build: {
        outDir: '../../docs/demo',
        emptyOutDir: true
    },
    resolve: {
        alias: {
            '@src': path.resolve(__dirname, '../../src')
        }
    },
    define: {
        'process.env': {} // anchor might need this
    }
});
