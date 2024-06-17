// eslint-disable-next-line import/no-extraneous-dependencies
import { defineConfig } from 'cypress';
// eslint-disable-next-line import/no-extraneous-dependencies
import codeCoverageTask from '@cypress/code-coverage/task';

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      codeCoverageTask(on, config);
      return config;
    },
  },
});
