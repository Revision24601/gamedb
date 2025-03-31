// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';

// Configure Cypress for e2e testing
Cypress.config('baseUrl', 'http://localhost:3000');

// Preserve cookies between tests
Cypress.Cookies.defaults({
  preserve: ['next-auth.session-token', 'next-auth.csrf-token', 'next-auth.callback-url']
});

// Log failed test details
Cypress.on('test:after:run', (test, runnable) => {
  if (test.state === 'failed') {
    console.log('Test failed:', test.title);
    console.log('Error:', test.err);
  }
});

// Automatically log console errors from application
Cypress.on('window:before:load', (win) => {
  cy.spy(win.console, 'error').as('consoleError');
});

// This ensures that after each test, we check if there were any console errors
afterEach(() => {
  cy.get('@consoleError').then((consoleError) => {
    expect(consoleError).to.have.callCount(0);
  });
}); 