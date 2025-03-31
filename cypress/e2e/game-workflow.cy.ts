describe('Game Management Workflow', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should allow users to add a new game', () => {
    // Navigate to Add Game page
    cy.contains('Add Game').click();
    cy.url().should('include', '/games/new');

    // Fill in the form
    cy.get('input[id="title"]').type('Cypress Test Game');
    cy.get('input[id="platform"]').type('Testing Platform');
    cy.get('select[id="status"]').select('Playing');
    cy.get('input[id="rating"]').clear().type('8');
    cy.get('input[id="hoursPlayed"]').clear().type('5');
    
    // Submit the form
    cy.contains('button', 'Add Game').click();
    
    // Verify we're redirected to the games list
    cy.url().should('include', '/games');
    
    // Verify the game appears in the list
    cy.contains('Cypress Test Game').should('be.visible');
  });

  it('should allow users to search for games', () => {
    // Navigate to Games page
    cy.visit('/games');
    
    // Search for the game we added
    cy.get('input[placeholder*="Search"]').type('Cypress Test Game');
    cy.get('button[type="submit"]').click();
    
    // Verify search results
    cy.contains('Cypress Test Game').should('be.visible');
    
    // Clear search and verify all games are shown
    cy.get('input[placeholder*="Search"]').clear();
    cy.get('button[type="submit"]').click();
    cy.get('div.card').should('have.length.greaterThan', 0);
  });

  it('should allow users to view game details', () => {
    // Navigate to Games page
    cy.visit('/games');
    
    // Find and click on the game we added
    cy.contains('Cypress Test Game').click();
    
    // Verify we're on the details page
    cy.url().should('include', '/games/');
    cy.contains('h1', 'Cypress Test Game').should('be.visible');
    cy.contains('Playing').should('be.visible');
    cy.contains('Testing Platform').should('be.visible');
  });

  it('should allow users to edit a game', () => {
    // Find and view the game we added
    cy.visit('/games');
    cy.contains('Cypress Test Game').click();
    
    // Click Edit button
    cy.contains('Edit').click();
    
    // Verify we're on the edit page
    cy.url().should('include', '/edit');
    
    // Update the game
    cy.get('input[id="title"]').clear().type('Updated Cypress Game');
    cy.get('select[id="status"]').select('Completed');
    
    // Save changes
    cy.contains('Save Changes').click();
    
    // Verify we're redirected to the details page with updates
    cy.url().should('not.include', '/edit');
    cy.contains('h1', 'Updated Cypress Game').should('be.visible');
    cy.contains('Completed').should('be.visible');
  });

  it('should allow users to delete a game', () => {
    // Find and view the game we added
    cy.visit('/games');
    cy.contains('Updated Cypress Game').click();
    
    // Click Delete button
    cy.contains('Delete').click();
    
    // Confirm deletion in modal
    cy.contains('Yes, Delete').click();
    
    // Verify we're redirected to the games list
    cy.url().should('include', '/games');
    cy.url().should('not.include', '/games/');
    
    // Verify the game is no longer in the list
    cy.contains('Updated Cypress Game').should('not.exist');
  });
}); 