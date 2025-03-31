// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// -- This is a parent command --
Cypress.Commands.add('login', (email, password) => {
  cy.session([email, password], () => {
    cy.visit('/login');
    cy.get('input[name="email"]').type(email);
    cy.get('input[name="password"]').type(password);
    cy.get('button[type="submit"]').click();
    cy.url().should('not.include', '/login');
  });
});

// Custom command to reset the database
Cypress.Commands.add('resetDatabase', () => {
  cy.request('POST', '/api/test/reset-db');
});

// Custom command to add a test game
Cypress.Commands.add('addTestGame', (game = {}) => {
  const defaultGame = {
    title: 'Cypress Test Game',
    platform: 'Test Platform',
    status: 'Playing',
    rating: 8,
    hoursPlayed: 5,
    imageUrl: 'https://via.placeholder.com/300x400',
    notes: 'Created by Cypress test'
  };
  
  const testGame = { ...defaultGame, ...game };
  
  return cy.request('POST', '/api/games', testGame).then((response) => {
    return response.body;
  });
});

// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })

// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })

// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>
      resetDatabase(): Chainable<void>
      addTestGame(game?: Partial<{
        title: string;
        platform: string;
        status: string;
        rating: number;
        hoursPlayed: number;
        imageUrl: string;
        notes: string;
      }>): Chainable<any>
    }
  }
} 