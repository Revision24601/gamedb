import React from 'react';
import { mount } from 'cypress/react18';
import StatusSelector from '../../components/StatusSelector';

describe('StatusSelector Component', () => {
  it('renders with the correct options', () => {
    // Define the props
    const status = 'Playing';
    const onChange = cy.stub().as('onChange');
    
    // Mount the component
    mount(<StatusSelector status={status} onChange={onChange} />);
    
    // Check if the component renders with the correct initial value
    cy.get('select').should('have.value', 'Playing');
    
    // Check if all status options are present
    cy.get('select option').should('have.length', 5);
    cy.get('select option').eq(0).should('have.text', 'Playing');
    cy.get('select option').eq(1).should('have.text', 'Completed');
    cy.get('select option').eq(2).should('have.text', 'On Hold');
    cy.get('select option').eq(3).should('have.text', 'Dropped');
    cy.get('select option').eq(4).should('have.text', 'Plan to Play');
  });

  it('calls onChange when a new status is selected', () => {
    // Define the props
    const status = 'Playing';
    const onChange = cy.stub().as('onChange');
    
    // Mount the component
    mount(<StatusSelector status={status} onChange={onChange} />);
    
    // Select a new status
    cy.get('select').select('Completed');
    
    // Check if onChange was called with the correct value
    cy.get('@onChange').should('have.been.calledWith', 'Completed');
  });

  it('displays the correct status color', () => {
    // Define the props
    const status = 'Playing';
    const onChange = cy.stub();
    
    // Mount the component
    mount(<StatusSelector status={status} onChange={onChange} />);
    
    // Check if the initial status has the correct color class
    cy.get('select').should('have.class', 'border-blue-500');
    
    // Change the status and check if the color updates
    cy.get('select').select('Completed');
    cy.get('select').should('have.class', 'border-green-500');
    
    cy.get('select').select('On Hold');
    cy.get('select').should('have.class', 'border-yellow-500');
    
    cy.get('select').select('Dropped');
    cy.get('select').should('have.class', 'border-red-500');
    
    cy.get('select').select('Plan to Play');
    cy.get('select').should('have.class', 'border-purple-500');
  });
}); 