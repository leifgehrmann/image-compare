describe('image-compare', () => {
  beforeEach(() => {
    const host = Cypress.env('IMAGE_COMPARE_HOST');
    if (typeof host !== 'string' || host === '') {
      throw new Error('cypress environment variable IMAGE_COMPARE_HOST is not set');
    }
    const configUrl = 'Todo'; // Todo
    cy.viewport(375, 800); // Roughly the size of an iPhone X.
    cy.visit(`${host}#${configUrl}`);
  });

  describe('Todo', () => {
    it('Todo', () => {
      // Todo:
    });
  });
});
