describe('Now Playing Detail Section', () => {
  beforeEach(() => {
    // Reset and seed the database with test data before each test
    cy.request('POST', '/api/test/reset-db');
    cy.addTestGame({
      title: 'Test Game 1',
      platform: 'PC',
      status: 'Playing',
      rating: 8,
      hoursPlayed: 15,
      imageUrl: 'https://example.com/image1.jpg',
      notes: 'Test notes 1'
    });
    cy.addTestGame({
      title: 'Test Game 2',
      platform: 'PlayStation 5',
      status: 'Playing',
      rating: 9,
      hoursPlayed: 25,
      imageUrl: 'https://example.com/image2.jpg',
      notes: 'Test notes 2'
    });
    cy.addTestGame({
      title: 'Test Game 3',
      platform: 'Nintendo Switch',
      status: 'Completed',
      rating: 7,
      hoursPlayed: 30,
      imageUrl: 'https://example.com/image3.jpg',
      notes: 'Test notes 3'
    });
  });

  it('should display detailed information about currently playing games', () => {
    cy.visit('/dashboard');
    
    // Verify the detail section is present
    cy.contains('Currently Playing Games').should('be.visible');
    
    // Verify only playing games are shown (2 out of 3 games)
    cy.get('[data-cy="now-playing-detail-item"]').should('have.length', 2);
    
    // Verify correct games are shown
    cy.contains('Test Game 1').should('be.visible');
    cy.contains('Test Game 2').should('be.visible');
    cy.contains('Test Game 3').should('not.exist');
    
    // Verify detailed information is displayed
    cy.contains('Platform:').should('be.visible');
    cy.contains('Playtime:').should('be.visible');
    cy.contains('Rating:').should('be.visible');
    
    // Verify progress bars are shown
    cy.get('[data-cy="progress-bar-detail"]').should('have.length', 2);
  });

  it('should navigate to game detail when clicking a game card', () => {
    cy.visit('/dashboard');
    
    // Click on the first detailed game card
    cy.get('[data-cy="now-playing-detail-item"]').first().click();
    
    // Verify navigation to the right page
    cy.url().should('include', '/games/');
    cy.contains('h1', 'Test Game 1').should('be.visible');
  });

  it('should display empty state when no games are being played', () => {
    // Delete all playing games
    cy.request('/api/games?status=Playing').then((response) => {
      const games = response.body.games;
      games.forEach(game => {
        cy.request('DELETE', `/api/games/${game._id}`);
      });
    });
    
    cy.visit('/dashboard');
    
    // Verify empty state message
    cy.contains('You don\'t have any games in progress right now').should('be.visible');
    cy.contains('Add Your First Game').should('be.visible');
  });
}); 