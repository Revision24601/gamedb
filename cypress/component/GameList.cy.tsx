import React from 'react';
import { mount } from 'cypress/react18';
import GameList from '../../components/GameList';

describe('GameList Component', () => {
  const mockGames = [
    {
      _id: '1',
      title: 'Test Game 1',
      platform: 'PC',
      status: 'Playing',
      rating: 8,
      hoursPlayed: 10,
      imageUrl: 'https://via.placeholder.com/300x400',
      notes: 'Test notes'
    },
    {
      _id: '2',
      title: 'Test Game 2',
      platform: 'PlayStation 5',
      status: 'Completed',
      rating: 9,
      hoursPlayed: 20,
      imageUrl: 'https://via.placeholder.com/300x400',
      notes: 'Test notes 2'
    }
  ];

  it('renders empty state when no games are provided', () => {
    mount(<GameList games={[]} />);
    
    cy.contains('No games found').should('be.visible');
  });

  it('renders the correct number of game cards', () => {
    mount(<GameList games={mockGames} />);
    
    cy.get('.card').should('have.length', 2);
  });

  it('displays game details correctly', () => {
    mount(<GameList games={mockGames} />);
    
    // Check first game
    cy.contains('Test Game 1').should('be.visible');
    cy.contains('PC').should('be.visible');
    cy.contains('Playing').should('be.visible');
    
    // Check second game
    cy.contains('Test Game 2').should('be.visible');
    cy.contains('PlayStation 5').should('be.visible');
    cy.contains('Completed').should('be.visible');
  });

  it('shows correct rating for each game', () => {
    mount(<GameList games={mockGames} />);
    
    // Find the rating elements and verify
    cy.get('.card').eq(0).within(() => {
      cy.get('.rating').should('contain', '8');
    });
    
    cy.get('.card').eq(1).within(() => {
      cy.get('.rating').should('contain', '9');
    });
  });

  it('links to the correct detail page for each game', () => {
    mount(<GameList games={mockGames} />);
    
    // Check that each game card has the correct href
    cy.get('a').eq(0).should('have.attr', 'href', '/games/1');
    cy.get('a').eq(1).should('have.attr', 'href', '/games/2');
  });
}); 