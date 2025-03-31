# Cypress Testing Guide for GameDB

This document provides guidelines for running and writing Cypress tests for the GameDB application.

## Test Types

The GameDB application uses Cypress for two types of testing:

1. **End-to-End (E2E) Tests**: These tests simulate user interactions with the full application, ensuring that the application works correctly from the user's perspective.

2. **Component Tests**: These tests focus on individual React components, testing their behavior in isolation.

## Setup

The Cypress testing environment is already configured in the project. The main configuration files are:

- `cypress.config.ts`: The main Cypress configuration
- `cypress/support/e2e.ts`: Configuration for E2E tests
- `cypress/support/component.ts`: Configuration for component tests
- `cypress/support/commands.ts`: Custom Cypress commands

## Running Tests

### E2E Tests

To run E2E tests in interactive mode:

```bash
npm run cypress
```

To run E2E tests in headless mode:

```bash
npm run cypress:headless
```

To start the development server and run E2E tests:

```bash
npm run e2e
```

### Component Tests

To run component tests:

```bash
npm run cypress -- --component
```

## Test Structure

### E2E Tests

E2E tests are located in the `cypress/e2e` directory and follow a workflow-based approach. The main test file is:

- `game-workflow.cy.ts`: Tests the complete game management workflow (add, search, view, edit, delete)

### Component Tests

Component tests are located in the `cypress/component` directory and test individual components:

- `StatusSelector.cy.tsx`: Tests the StatusSelector component
- `GameList.cy.tsx`: Tests the GameList component

## Custom Commands

The following custom commands are available:

- `cy.login(email, password)`: Logs in a user with the given credentials
- `cy.resetDatabase()`: Resets the database to a clean state with test data
- `cy.addTestGame(game)`: Adds a test game to the database

## Writing New Tests

### E2E Tests

When writing new E2E tests:

1. Use a descriptive name that reflects the user workflow
2. Use `beforeEach` to set up the environment (visit homepage, reset database, etc.)
3. Break down the test into logical steps
4. Use assertions to verify the expected behavior
5. Clean up after the test if necessary

Example:

```typescript
describe('Game Search', () => {
  beforeEach(() => {
    cy.resetDatabase();
    cy.visit('/games');
  });

  it('should filter games based on search term', () => {
    // Test implementation
  });
});
```

### Component Tests

When writing new component tests:

1. Import the component and its dependencies
2. Create mock props/data
3. Mount the component with the mock props
4. Test component rendering and behavior
5. Test event handling if applicable

Example:

```typescript
import MyComponent from '../../components/MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    const props = { /* mock props */ };
    mount(<MyComponent {...props} />);
    // Assertions
  });
});
```

## Best Practices

1. Keep tests independent of each other
2. Avoid unnecessary waiting, use Cypress's automatic waiting
3. Use data attributes for targeting elements (`data-cy="search-button"`)
4. Don't test third-party code
5. Clean up test data after tests
6. Keep test files focused and organized

## Test Database

The application includes a test API endpoint for resetting the database during testing:

- `POST /api/test/reset-db`: Clears the games collection and adds test data

This endpoint is only available in development and test environments.

## Troubleshooting

If tests are failing unexpectedly:

1. Check if the application is running correctly
2. Verify that selectors are correct
3. Look for changes in the application that might affect tests
4. Check for timing issues
5. Review the Cypress logs and screenshots/videos

## CI/CD Integration

The Cypress tests are configured to run in the CI/CD pipeline. The workflow:

1. Builds the application
2. Starts the application server
3. Runs Cypress tests in headless mode
4. Uploads test results as artifacts 