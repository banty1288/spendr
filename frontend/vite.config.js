import { defineConfig } from 'vite';
import path from 'path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
function figmaAssetResolver() {
    return {
        name: 'figma-asset-resolver',
        resolveId(id) {
            if (id.startsWith('figma:asset/')) {
                const filename = id.replace('figma:asset/', '');
                return path.resolve(__dirname, 'src/assets', filename);
            }
        },
    };
}
export default defineConfig({
    base: '/',
    plugins: [
        figmaAssetResolver(),
        react(),
        tailwindcss(),
    ],
    resolve: {
        alias: {
            // Alias @ to the src directory
            '@': path.resolve(__dirname, './src'),
        },
    },
    // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
    assetsInclude: ['**/*.svg', '**/*.csv'],
    server: {
        host: 'localhost',
        port: 5173,
        strictPort: true,
        hmr: {
            overlay: false,
        },
    },
    build: {
        outDir: 'dist',
        emptyOutDir: true,
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes('node_modules')) {
                        if (id.includes('@firebase/firestore') || id.includes('firebase/firestore'))
                            return 'firebase-firestore';
                        if (id.includes('@firebase/auth') || id.includes('firebase/auth'))
                            return 'firebase-auth';
                        if (id.includes('firebase'))
                            return 'firebase-core';
                        if (id.includes('@google/generative-ai'))
                            return 'ai-vendor';
                        if (id.includes('jspdf') || id.includes('html-to-image'))
                            return 'pdf-vendor';
                        if (id.includes('recharts'))
                            return 'charts-vendor';
                        if (id.includes('react') || id.includes('react-dom') || id.includes('react-router'))
                            return 'react-vendor';
                        if (id.includes('motion') || id.includes('framer-motion'))
                            return 'motion-vendor';
                    }
                }
            }
        }
    }
});
