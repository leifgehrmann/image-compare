import { defineConfig } from 'cypress';

export default defineConfig({
  video: false,
  e2e: {
    setupNodeEvents(on, config) {
      // eslint-disable-next-line vue/max-len
      // eslint-disable-next-line import/extensions,@typescript-eslint/no-var-requires,global-require
      return import('./cypress/plugins/index.js').then((self) => self(on, config));
    },
    excludeSpecPattern: '*.js',
  },
});
