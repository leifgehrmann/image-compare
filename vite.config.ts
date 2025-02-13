/* eslint-disable import/no-extraneous-dependencies */
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import istanbul from 'vite-plugin-istanbul';
// eslint-disable-next-line import/no-unresolved
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => ({
  plugins: [
    tailwindcss(),
    vue(),
    istanbul({
      include: 'src/*',
      exclude: ['node_modules', 'test/', 'cypress/'],
      extension: ['.js', '.ts', '.vue'],
      checkProd: mode === 'production',
      forceBuildInstrument: mode !== 'production',
    }),
  ],
  build: {
    sourcemap: mode !== 'production',
  },
  preview: {
    port: 5000,
  },
}));
