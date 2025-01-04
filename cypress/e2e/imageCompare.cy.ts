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

// Roughly the size of an iPhone X.
const viewportWidth = 375;
const viewportHeight = 800;

describe('image-compare', () => {
  describe('configuration loads successfully', () => {
    beforeEach(() => {
      cy.viewport(viewportWidth, viewportHeight);
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
        const imageUrl = getFullImagePath('example/dark.svg');
        cy.get(`img[src="${imageUrl}"]`).should('have.length', 1);
      });
      describe('mouse events', () => {
        it('clicking the buttons will change the selection', () => {
          cy.contains('Light Variant').click();
          const imageUrl = getFullImagePath('example/light.svg');
          cy.get(`img[src="${imageUrl}"]`).should('have.length', 1);
          cy.contains('Dark Variant').click();
        });
      });
      describe('keyboard events', () => {
        it('pressing left/right will move the selection left/right respectively', () => {
          cy.contains('Light Variant').focus().type('{rightarrow}');
          let imageUrl = getFullImagePath('example/light.svg');
          cy.get(`img[src="${imageUrl}"]`).should('have.length', 1);
          cy.contains('Light Variant').focus().type('{leftarrow}');
          imageUrl = getFullImagePath('example/dark.svg');
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
              const imageUrl = getFullImagePath('example/first-republic.svg');
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
              const imageUrl = getFullImagePath('example/first-republic.svg');
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
              const imageUrl = getFullImagePath('example/dark.svg');
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
              const imageUrl = getFullImagePath('example/dark.svg');
              cy.get(`img[src="${imageUrl}"]`).should('have.length', 1);
              cy.contains('Dark Variant').click();
            },
          );
        });
      });
    });
    describe('landscape viewport', () => {
      it('fits the image to the container height', () => {
        cy.viewport(viewportHeight, viewportWidth); // Landscape
        cy.get('img').should('have.css', 'height', '290px');
        cy.get('img').should('have.css', 'width', '435px');
      });
    });
  });
  describe('configuration with multiple sources loads successfully', () => {
    beforeEach(() => {
      cy.viewport(viewportWidth, viewportHeight);
      const host = getHost();
      const configUrl = `${host}example/config-sources.json`;
      cy.visit(getHostUrlWithConfig(configUrl), {
        onBeforeLoad(win) {
          cy.stub(win, 'matchMedia')
            .withArgs('(prefers-color-scheme: dark)')
            .returns({
              matches: true,
            });
        },
      });
    });

    describe('dark-mode image', () => {
      it('shows a picture with a dark-mode source', () => {
        cy.get('button').should('have.length', 2);
        cy.get('button').eq(0).should('have.text', 'Square');
        cy.get('button').eq(1).should('have.text', 'Circle');
        const imageUrl = getFullImagePath('example/geometry-square-dark.svg');
        cy.get(`sources[srcset="${imageUrl}"][media="(prefers-color-scheme: dark)"]`).should('have.length', 1);
      });
    });
  });
  describe('configuration loads successfully with invalid images', () => {
    beforeEach(() => {
      cy.viewport(viewportWidth, viewportHeight);
      const host = getHost();
      const configUrl = `${host}example/config-invalid.json`;
      cy.visit(getHostUrlWithConfig(configUrl));
    });
    describe('segmented controls with invalid image', () => {
      it('shows two buttons in the correct selection with the correct image', () => {
        cy.get('button').should('have.length', 2);
        cy.get('button').eq(0).should('have.text', 'A');
        cy.get('button').eq(1).should('have.text', 'B');
        cy.get('button span.opacity-100').should('have.length', 1);
        cy.get('button span.opacity-70').should('have.length', 1);
        const imageUrl = getFullImagePath('example/ceci-nest-pas-une-pic.png');
        cy.get(`img[src="${imageUrl}"]`).should('have.length', 1);
      });
    });
  });
  describe('app loads correctly in an iframe', () => {
    beforeEach(() => {
      cy.viewport(viewportWidth, viewportHeight);
      cy.visit(`${getHost()}example/iframe.html`);
    });
    describe('iframe loads segmented controls', () => {
      it('shows four buttons', () => {
        cy.get('iframe').then((iframe) => {
          const iframeBody = iframe.contents().find('body');
          cy.wrap(iframeBody).find('button').should('have.length', 4);
        });
      });
    });
  });
  describe('configuration load failures', () => {
    beforeEach(() => {
      cy.viewport(viewportWidth, viewportHeight);
      cy.visit(getHost());
    });
    it('displays a message saying the configuration could not be loaded', () => {
      cy.contains('Failed to load configuration').should('have.length', 1);
    });
  });
});
