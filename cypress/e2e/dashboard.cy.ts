describe('Dashboard Page', () => {
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

  it('should display the dashboard with stats and chart', () => {
    cy.visit('/dashboard');
    
    // Verify page title and header
    cy.contains('h1', 'Gaming Dashboard').should('be.visible');
    
    // Verify stat cards are displayed
    cy.contains('Total Games').should('be.visible');
    cy.contains('Completed').should('be.visible');
    cy.contains('Avg Rating').should('be.visible');
    cy.contains('Hours Playing').should('be.visible');
    
    // Verify total games count is correct
    cy.contains('Total Games').parent().parent().contains('3');
    
    // Verify completed games count is correct
    cy.contains('Completed').parent().parent().contains('1');
    
    // Verify hours playing is the sum of all currently playing games
    cy.contains('Hours Playing').parent().parent().contains('40');
    
    // Verify the chart is displayed
    cy.contains('Currently Playing Games').should('be.visible');
    cy.get('svg').should('be.visible');
    
    // Verify only playing games are in the chart (2 playing games)
    cy.get('.recharts-bar-rectangle').should('have.length', 2);
    
    // Verify the table displays playing games
    cy.contains('Playing Games List').should('be.visible');
    cy.contains('Test Game 1').should('be.visible');
    cy.contains('Test Game 2').should('be.visible');
    cy.contains('Test Game 3').should('not.exist');
  });

  it('should navigate to game detail when clicking on a chart bar', () => {
    cy.visit('/dashboard');
    
    // Find game ID first to validate we navigate to the correct page
    cy.request('/api/games?status=Playing').then((response) => {
      const games = response.body.games;
      const firstGame = games.find(g => g.title === 'Test Game 1');
      
      // Click on the chart bar for Test Game 1
      cy.contains('Test Game 1').should('be.visible');
      cy.get('.recharts-bar-rectangle').first().click({ force: true });
      
      // Verify navigation to the game detail page
      cy.url().should('include', `/games/${firstGame._id}`);
      cy.contains('Test Game 1').should('be.visible');
    });
  });

  it('should display empty state when no games are being played', () => {
    // Remove all the playing games
    cy.request('/api/games?status=Playing').then((response) => {
      const games = response.body.games;
      
      // Delete all playing games
      games.forEach(game => {
        cy.request('DELETE', `/api/games/${game._id}`);
      });
      
      // Now visit the dashboard
      cy.visit('/dashboard');
      
      // Verify empty state message
      cy.contains('No Games Currently Being Played').should('be.visible');
      cy.contains('When you start playing games, they\'ll appear here with their play time').should('be.visible');
      cy.contains('Add Your First Game').should('be.visible');
    });
  });
}); 