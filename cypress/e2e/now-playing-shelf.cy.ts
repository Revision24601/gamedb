describe('Now Playing Shelf', () => {
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

  it('should display only games with Playing status in the shelf', () => {
    cy.visit('/');
    
    // Verify the shelf is present
    cy.contains('h2', 'Now Playing').should('be.visible');
    
    // Verify only playing games are shown (2 out of 3 games)
    cy.get('[data-cy="now-playing-item"]').should('have.length', 2);
    
    // Verify correct games are shown
    cy.contains('Test Game 1').should('be.visible');
    cy.contains('Test Game 2').should('be.visible');
    cy.contains('Test Game 3').should('not.exist');
  });

  it('should show progress bars for each game', () => {
    cy.visit('/');
    
    // Verify progress bars exist for each game
    cy.get('[data-cy="progress-bar"]').should('have.length', 2);
    
    // Verify first game's progress (15 hours = ~38% of 40 hours)
    cy.get('[data-cy="progress-bar"]').first().invoke('attr', 'style')
      .should('include', 'width: 38%');
      
    // Verify second game's progress (25 hours = ~63% of 40 hours)
    cy.get('[data-cy="progress-bar"]').eq(1).invoke('attr', 'style')
      .should('include', 'width: 63%');
  });

  it('should navigate to game detail when clicking a game', () => {
    cy.visit('/');
    
    // Click on the first game
    cy.contains('Test Game 1').click();
    
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
    
    cy.visit('/');
    
    // Verify empty state message
    cy.contains('You don\'t have any games in progress right now').should('be.visible');
    cy.contains('Add Your First Game').should('be.visible');
  });
}); 