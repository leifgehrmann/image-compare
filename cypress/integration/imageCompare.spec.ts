function getHost(): string {
  const host = Cypress.env('IMAGE_COMPARE_HOST');
  if (typeof host !== 'string' || host === '') {
    throw new Error('cypress environment variable IMAGE_COMPARE_HOST is not set');
  }
  return host;
}

function getHostUrlWithConfig(config: string): string {
  const host = getHost();
  return `${host}#${config}`;
}

function getFullImagePath(image: string): string {
  return `/${image}`;
}

function resolveElement(elements: JQuery): HTMLElement {
  if (elements.length !== 1) {
    throw new Error('Unexpected number of elements found');
  }
  return elements[0];
}

function touchSwipe(
  destination: {x: number, y: number},
  selector: string,
  callback: () => void,
  cancel = false,
) {
  cy.get(selector).then((elements) => {
    const element = resolveElement(elements);
    const currentTouches = [{
      clientX: element.getBoundingClientRect().x,
      clientY: element.getBoundingClientRect().y,
    }];
    const newTouches = [{
      clientX: destination.x,
      clientY: destination.y,
    }];
    cy.get(selector)
      .trigger('touchstart', {
        touches: currentTouches,
        changedTouches: currentTouches,
      })
      // Simulate touchmove with an empty touches list (for code-coverage sake)
      .trigger('touchmove', { touches: [] })
      .trigger('touchmove', {
        touches: newTouches,
        changedTouches: newTouches,
      })
      .trigger(cancel ? 'touchcancel' : 'touchend', {
        touches: newTouches,
        changedTouches: newTouches,
      });
    callback();
  });
}

const viewportWidth = 375;
const viewportHeight = 800;

describe('image-compare', () => {
  describe('configuration loads successfully', () => {
    beforeEach(() => {
      cy.viewport(viewportWidth, viewportHeight); // Roughly the size of an iPhone X.
      const host = getHost();
      const configUrl = `${host}example/config-local.json`;
      cy.visit(getHostUrlWithConfig(configUrl));
    });

    describe('segmented controls', () => {
      it('shows four buttons in the correct selection with the correct image', () => {
        cy.get('button').should('have.length', 4);
        cy.get('button').eq(0).should('have.text', 'Dark Variant');
        cy.get('button').eq(1).should('have.text', 'Light Variant');
        cy.get('button span.opacity-100').should('have.length', 1);
        cy.get('button span.opacity-70').should('have.length', 3);
        const imageUrl = getFullImagePath('example/dark.png');
        cy.get(`img[src="${imageUrl}"]`).should('have.length', 1);
      });
      describe('mouse events', () => {
        it('clicking the buttons will change the selection', () => {
          cy.contains('Light Variant').click();
          const imageUrl = getFullImagePath('example/light.png');
          cy.get(`img[src="${imageUrl}"]`).should('have.length', 1);
          cy.contains('Dark Variant').click();
        });
      });
      describe('keyboard events', () => {
        it('pressing left/right will move the selection left/right respectively', () => {
          cy.contains('Light Variant').focus().type('{rightarrow}');
          let imageUrl = getFullImagePath('example/light.png');
          cy.get(`img[src="${imageUrl}"]`).should('have.length', 1);
          cy.contains('Light Variant').focus().type('{leftarrow}');
          imageUrl = getFullImagePath('example/dark.png');
          cy.get(`img[src="${imageUrl}"]`).should('have.length', 1);
          cy.contains('Dark Variant').click();
        });
      });
      describe('touch events', () => {
        it('changes selection when touch-dragging along the control surface starting from the selected item and leaving offscreen', () => {
          touchSwipe(
            { x: (viewportWidth / 4) * 2.5, y: viewportHeight / 2 },
            'button:nth-child(1)',
            () => {
              const imageUrl = getFullImagePath('example/first-republic.png');
              cy.get(`img[src="${imageUrl}"]`).should('have.length', 1);
              cy.contains('Dark Variant').click();
            },
          );
        });
        it('does change selection when touch-dragging along the control surface starting from an unselected item and leaving on another item', () => {
          touchSwipe(
            { x: (viewportWidth / 4) * 2.5, y: viewportHeight - 40 },
            'button:nth-of-type(2)',
            () => {
              const imageUrl = getFullImagePath('example/first-republic.png');
              cy.get(`img[src="${imageUrl}"]`).should('have.length', 1);
              cy.contains('Dark Variant').click();
            },
          );
        });
        it('does not change selection when touch-dragging beyond control surface and releasing', () => {
          touchSwipe(
            { x: viewportWidth - 5, y: viewportHeight / 2 },
            'button:nth-child(1)',
            () => {
              const imageUrl = getFullImagePath('example/dark.png');
              cy.get(`img[src="${imageUrl}"]`).should('have.length', 1);
              cy.contains('Dark Variant').click();
            },
          );
        });
        it('does not change selection when touch-dragging directly in middle of control surface', () => {
          touchSwipe(
            { x: viewportWidth / 2, y: viewportHeight / 2 },
            'button:nth-child(1)',
            () => {
              const imageUrl = getFullImagePath('example/dark.png');
              cy.get(`img[src="${imageUrl}"]`).should('have.length', 1);
              cy.contains('Dark Variant').click();
            },
          );
        });
      });
    });
  });
  describe('configuration loads successfully with inavlid images', () => {
    beforeEach(() => {
      cy.viewport(viewportWidth, viewportHeight); // Roughly the size of an iPhone X.
      const host = getHost();
      const configUrl = `${host}example/config-invalid.json`;
      cy.visit(getHostUrlWithConfig(configUrl));
    });
  });
  describe('configuration load failures', () => {
    beforeEach(() => {
      cy.viewport(viewportWidth, viewportHeight); // Roughly the size of an iPhone X.
      cy.visit(getHost());
    });
    it('displays a message saying the configuration could not be loaded', () => {
      cy.contains('Failed to load configuration').should('have.length', 1);
    });
  });
});
