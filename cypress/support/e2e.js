// eslint-disable-next-line import/no-extraneous-dependencies
import '@cypress/code-coverage/support';

// Chrome apparently likes to log errors saying the "ResizeObserver loop limit exceeded".
// This isn't a huge issue for us since we are running a high speed automated test, so
// here we ignore the error if it comes up. If there are functional problems as a result,
// the tests should be designed to highlight them, regardless of the error being silenced.
// https://stackoverflow.com/a/63519375
const resizeObserverLoopErrRe = /^[^(ResizeObserver loop limit exceeded)]/;
// eslint-disable-next-line consistent-return,no-undef
Cypress.on('uncaught:exception', (err) => {
  /* returning false here prevents Cypress from failing the test */
  if (resizeObserverLoopErrRe.test(err.message)) {
    return false;
  }
});
