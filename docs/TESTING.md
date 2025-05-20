# Testing Guide for Habit-Quest

This document provides guidelines for writing and running tests for the Habit-Quest application.

## Testing Framework

We use Jest as our testing framework along with React Testing Library for component testing. These tools allow us to:

- Write unit tests for individual components and functions
- Test component rendering and interactions
- Ensure code quality and prevent regressions

## Test Types

### Unit Tests
Tests for individual functions and components in isolation.

### Integration Tests
Tests for how components work together and how the application integrates with APIs.

### API Tests
Tests for API endpoints to ensure they behave as expected.

### End-to-End (E2E) Tests
Tests that simulate user journeys through the application to validate complete features.

## Running Tests

To run tests locally, use the following commands:

```bash
# Run all tests
npm run test

# Run tests in watch mode (for development)
npm run test:watch

# Run tests with coverage
npm run test:ci
```

## Writing Tests

### Folder Structure

Tests should be placed in the `__tests__` directory, mirroring the structure of the source code:

```
__tests__/
  components/
    component-name.test.tsx
  api/
    endpoint-name.test.ts
  utils/
    utility-name.test.ts
  e2e/
    feature-name.test.ts
```

### Component Test Example

Here's an example of a basic component test:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MyComponent } from '../../components/my-component';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
  
  it('handles user interactions', async () => {
    const onClickMock = jest.fn();
    render(<MyComponent onClick={onClickMock} />);
    
    await userEvent.click(screen.getByRole('button'));
    
    expect(onClickMock).toHaveBeenCalledTimes(1);
  });
});
```

### API Test Example

```ts
import { NextRequest } from 'next/server';
import { GET, POST } from '../../app/api/endpoint/route';

// Mock dependencies
jest.mock('../../lib/mongodb');
jest.mock('../../lib/auth');

describe('API Endpoint', () => {
  it('handles GET requests', async () => {
    const mockRequest = new NextRequest('http://localhost:3000/api/endpoint');
    const response = await GET(mockRequest);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });
});
```

### E2E Test Example

For E2E tests, we use a Page Object Model pattern with Playwright:

```ts
import { test, expect } from '@playwright/test';

class TasksPage {
  constructor(private page: any) {}

  async navigate() {
    await this.page.goto('/tasks');
  }

  async addTask(title: string) {
    await this.page.click('button:has-text("Add Task")');
    await this.page.fill('input#task-title', title);
    await this.page.click('button:has-text("Save")');
  }
}

test('User can add a task', async ({ page }) => {
  const tasksPage = new TasksPage(page);
  await tasksPage.navigate();
  await tasksPage.addTask('New Test Task');
  
  await expect(page.locator('text=New Test Task')).toBeVisible();
});
```

### Best Practices

1. **Test Behavior, Not Implementation**: Focus on what the component does, not how it's built.
2. **Use Semantic Queries**: Use queries like `getByRole`, `getByText`, and `getByLabelText` instead of `getByTestId` when possible.
3. **Mock External Dependencies**: Use Jest's mocking capabilities to isolate the code being tested.
4. **Keep Tests Simple**: Each test should verify one specific behavior.
5. **Test Edge Cases**: Include tests for error states and boundary conditions.
6. **Follow AAA Pattern**: Arrange, Act, Assert - set up the test, perform the action, verify the result.

## Continuous Integration

Tests are automatically run on pull requests to the main, master, and development branches via GitHub Actions. The workflow will:

1. Check out the code
2. Install dependencies
3. Run linting
4. Run tests with coverage
5. Upload coverage reports to Codecov (if configured)

## Vercel Deployment Tests

We have specialized workflows for testing before Vercel deployments:

### Preview Deployments

For pull requests and non-main branches, the `vercel-preview.yml` workflow:

1. Runs all tests and linting
2. Verifies the build process
3. Posts results as a comment on the PR
4. Allows the Vercel preview to continue if all checks pass

### Production Deployments

For the main branch, the `vercel-production.yml` workflow:

1. Runs all tests and linting with stricter criteria
2. Verifies the build process with production-like settings
3. Creates a GitHub issue if any tests fail
4. Performs a smoke test after deployment to verify the site is operating correctly

## Code Coverage

We aim for high test coverage to ensure code quality. To view coverage reports:

1. Run `npm run test:ci`
2. Open `coverage/lcov-report/index.html` in your browser

## Adding New Tests

When adding a new feature or fixing a bug:

1. Write tests that verify the new functionality
2. Make sure all existing tests still pass
3. Aim for at least 80% code coverage for new code
4. Include unit tests for components and integration tests for complex features
5. For critical user journeys, add E2E tests
6. Submit your PR with both the implementation and tests

## Setting Up E2E Tests

To run E2E tests locally:

1. Install Playwright: `npm install --save-dev @playwright/test`
2. Install browsers: `npx playwright install`
3. Run tests: `npx playwright test` 