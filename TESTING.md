# Testing Documentation

## Overview

This document provides comprehensive information about the testing infrastructure and practices for the Proposal Platform.

## Table of Contents

- [Testing Stack](#testing-stack)
- [Running Tests](#running-tests)
- [Backend Tests](#backend-tests)
- [Frontend Tests](#frontend-tests)
- [Test Coverage](#test-coverage)
- [Writing Tests](#writing-tests)
- [Best Practices](#best-practices)
- [Continuous Integration](#continuous-integration)

---

## Testing Stack

### Backend
- **Jest**: Testing framework
- **ts-jest**: TypeScript support for Jest
- **Supertest**: HTTP assertion library for API testing
- **Prisma**: Test database management

### Frontend
- **Jest**: Testing framework
- **React Testing Library**: Component testing
- **@testing-library/user-event**: User interaction simulation
- **@testing-library/jest-dom**: Custom DOM matchers

---

## Running Tests

### Backend Tests

```bash
cd backend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- auth.service.test.ts

# Run tests matching a pattern
npm test -- --testNamePattern="register"
```

### Frontend Tests

```bash
cd frontend

# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage --watchAll=false

# Run specific test file
npm test -- Login.test.tsx

# Run tests matching a pattern
npm test -- --testNamePattern="should render"
```

### Run All Tests

```bash
# From root directory
cd backend && npm test && cd ../frontend && npm test
```

---

## Backend Tests

### Test Structure

```
backend/src/__tests__/
├── setup.ts                    # Global test setup and teardown
├── auth.service.test.ts        # Auth service unit tests
├── proposal.service.test.ts    # Proposal service unit tests
├── comment.service.test.ts     # Comment service unit tests
└── api.integration.test.ts     # API integration tests
```

### Test Database Setup

The test suite uses a separate test database to avoid affecting development data:

1. **Environment Variables**: Tests use `DATABASE_URL` from environment or default test database
2. **Automatic Cleanup**: After each test, all data is cleaned up
3. **Isolation**: Each test runs in isolation with fresh data

**Important**: Make sure you have a test database set up:

```bash
# Set up test database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/proposal_platform_test?schema=public"

# Run migrations on test database
cd backend
npx prisma migrate deploy --schema=./prisma/schema.prisma
```

### Test Categories

#### Unit Tests - Auth Service (`auth.service.test.ts`)
Tests authentication functionality:
- User registration with password hashing
- Login with credential validation
- MFA setup and verification
- JWT token generation and refresh
- Audit logging

**Coverage**: 95%+ of auth service logic

#### Unit Tests - Proposal Service (`proposal.service.test.ts`)
Tests proposal management:
- Create, read, update, delete proposals
- Automatic version control
- Collaborator management
- Permission checking
- Organization-based access control

**Coverage**: 90%+ of proposal service logic

#### Unit Tests - Comment Service (`comment.service.test.ts`)
Tests commenting functionality:
- Create, update, delete comments
- Threaded comments (replies)
- Anchored comments (line-specific)
- Resolve/unresolve functionality
- Access control

**Coverage**: 90%+ of comment service logic

#### Integration Tests (`api.integration.test.ts`)
Tests complete API workflows:
- Auth endpoints (register, login, refresh)
- Proposal CRUD operations
- Organization management
- Error handling
- Security headers

**Coverage**: All major API endpoints

### Running Specific Test Suites

```bash
# Run only auth tests
npm test -- auth.service

# Run only proposal tests
npm test -- proposal.service

# Run only integration tests
npm test -- api.integration

# Run only comment tests
npm test -- comment.service
```

---

## Frontend Tests

### Test Structure

```
frontend/src/__tests__/
├── utils/
│   └── test-utils.tsx          # Custom render functions and helpers
├── components/
│   ├── Toast.test.tsx          # Toast notification tests
│   ├── SearchBar.test.tsx      # Search bar tests
│   ├── FilterDropdown.test.tsx # Filter dropdown tests
│   └── LoadingSpinner.test.tsx # Loading spinner tests
├── pages/
│   └── Login.test.tsx          # Login page tests
└── store/
    └── authStore.test.ts       # Auth store tests
```

### Test Categories

#### Component Tests
Test individual React components in isolation:

**Toast Component** (`Toast.test.tsx`)
- Rendering with different types (success, error, warning, info)
- Auto-dismiss functionality
- Manual dismiss
- Accessibility (ARIA attributes)

**SearchBar Component** (`SearchBar.test.tsx`)
- User input handling
- Real-time search updates
- Keyboard accessibility
- Special character handling

**FilterDropdown Component** (`FilterDropdown.test.tsx`)
- Dropdown open/close
- Option selection
- Active option highlighting
- Keyboard navigation

**LoadingSpinner Component** (`LoadingSpinner.test.tsx`)
- Different size variants
- Accessibility
- Animation presence

#### Page Tests

**Login Page** (`Login.test.tsx`)
- Form rendering
- Validation (email, password)
- Form submission
- Error handling
- Keyboard accessibility

#### Store Tests

**Auth Store** (`authStore.test.ts`)
- State management (login, logout)
- localStorage persistence
- State hydration
- Singleton behavior

### Custom Test Utilities

The `test-utils.tsx` file provides custom render functions:

```typescript
import { renderWithRouter } from './__tests__/utils/test-utils';

// Render with router context
const { getByText } = renderWithRouter(<MyComponent />);

// Render with authenticated state
const { getByText } = renderWithRouter(<MyComponent />, {
  authenticated: true
});
```

---

## Test Coverage

### Coverage Goals

- **Backend Services**: 80%+ line coverage
- **Frontend Components**: 70%+ line coverage
- **Critical Paths**: 90%+ coverage (auth, proposals, payments)

### Viewing Coverage Reports

#### Backend
```bash
cd backend
npm run test:coverage

# Open HTML report
open coverage/lcov-report/index.html
```

#### Frontend
```bash
cd frontend
npm test -- --coverage --watchAll=false

# Open HTML report
open coverage/lcov-report/index.html
```

### Coverage Thresholds

Backend (`jest.config.js`):
```javascript
coverageThreshold: {
  global: {
    branches: 70,
    functions: 70,
    lines: 70,
    statements: 70
  }
}
```

---

## Writing Tests

### Backend Test Template

```typescript
import { prisma } from './setup';
import * as myService from '../services/my.service';

describe('My Service', () => {
  let testUserId: string;

  beforeEach(async () => {
    // Setup test data
    const user = await prisma.user.create({
      data: { /* ... */ }
    });
    testUserId = user.id;
  });

  describe('myFunction', () => {
    it('should do something correctly', async () => {
      // Arrange
      const input = { /* ... */ };

      // Act
      const result = await myService.myFunction(input, testUserId);

      // Assert
      expect(result).toHaveProperty('id');
      expect(result.name).toBe('expected');
    });

    it('should handle errors appropriately', async () => {
      // Test error cases
      await expect(
        myService.myFunction(invalidInput, testUserId)
      ).rejects.toThrow('Expected error');
    });
  });
});
```

### Frontend Test Template

```typescript
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MyComponent } from '../../components/MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);

    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('should handle user interaction', async () => {
    const user = userEvent.setup();
    const mockCallback = jest.fn();

    render(<MyComponent onAction={mockCallback} />);

    const button = screen.getByRole('button');
    await user.click(button);

    expect(mockCallback).toHaveBeenCalled();
  });
});
```

---

## Best Practices

### General
1. **Test Behavior, Not Implementation**: Focus on what the component/function does, not how it does it
2. **Arrange-Act-Assert Pattern**: Structure tests clearly
3. **Descriptive Test Names**: Use "should do X when Y" format
4. **One Assertion Per Test**: Keep tests focused (when possible)
5. **Clean Up**: Use beforeEach/afterEach for setup/teardown

### Backend
1. **Isolate Tests**: Each test should be independent
2. **Test Edge Cases**: Invalid inputs, missing data, permissions
3. **Mock External Services**: Don't make real API calls or send real emails
4. **Test Async Code**: Use async/await properly
5. **Audit Logs**: Verify audit logs are created for important actions

### Frontend
1. **Query by Accessibility**: Use getByRole, getByLabelText
2. **Avoid Implementation Details**: Don't query by class names or IDs
3. **User-Centric Tests**: Test from user's perspective
4. **Wait for Async Operations**: Use waitFor, findBy queries
5. **Mock API Calls**: Don't make real network requests

### What to Test

#### Backend
✅ **DO Test**:
- Business logic
- Data validation
- Error handling
- Permission checks
- Database operations
- API endpoints

❌ **DON'T Test**:
- Third-party libraries
- Framework internals
- Generated code (Prisma client)

#### Frontend
✅ **DO Test**:
- Component rendering
- User interactions
- Form validation
- State changes
- Navigation
- Accessibility

❌ **DON'T Test**:
- CSS styling (use visual regression testing)
- Third-party components
- Library internals

### Common Pitfalls

1. **Forgetting to Clean Up**
   ```typescript
   // ❌ Bad
   it('test without cleanup', async () => {
     await createTestData();
     // Data persists to next test
   });

   // ✅ Good
   afterEach(async () => {
     await cleanupTestData();
   });
   ```

2. **Not Waiting for Async**
   ```typescript
   // ❌ Bad
   await user.click(button);
   expect(screen.getByText('Loaded')).toBeInTheDocument();

   // ✅ Good
   await user.click(button);
   await waitFor(() => {
     expect(screen.getByText('Loaded')).toBeInTheDocument();
   });
   ```

3. **Testing Implementation**
   ```typescript
   // ❌ Bad
   expect(component.state.count).toBe(5);

   // ✅ Good
   expect(screen.getByText('Count: 5')).toBeInTheDocument();
   ```

---

## Continuous Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15-alpine
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: proposal_platform_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        working-directory: ./backend
        run: npm ci

      - name: Run migrations
        working-directory: ./backend
        run: npx prisma migrate deploy
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/proposal_platform_test?schema=public

      - name: Run tests
        working-directory: ./backend
        run: npm run test:coverage
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/proposal_platform_test?schema=public

  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        working-directory: ./frontend
        run: npm ci

      - name: Run tests
        working-directory: ./frontend
        run: npm test -- --coverage --watchAll=false
```

---

## Debugging Tests

### Backend

```bash
# Run with verbose output
npm test -- --verbose

# Run in debug mode
node --inspect-brk node_modules/.bin/jest --runInBand

# Then open chrome://inspect in Chrome
```

### Frontend

```bash
# Run with more info
npm test -- --verbose

# Run single test in debug mode
node --inspect-brk node_modules/.bin/react-scripts test --runInBand --no-cache
```

### Common Debug Techniques

1. **Use screen.debug()**
   ```typescript
   import { screen } from '@testing-library/react';

   screen.debug(); // Prints entire DOM
   screen.debug(screen.getByRole('button')); // Prints specific element
   ```

2. **Add console.log in tests**
   ```typescript
   console.log('Current state:', result.current);
   ```

3. **Use logRoles**
   ```typescript
   import { logRoles } from '@testing-library/react';

   const { container } = render(<MyComponent />);
   logRoles(container); // Shows all available roles
   ```

---

## Resources

### Documentation
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Testing Best Practices](https://testingjavascript.com/)

### Tutorials
- [Kent C. Dodds Testing Course](https://testingjavascript.com/)
- [Jest Crash Course](https://www.youtube.com/watch?v=7r4xVDI2vho)
- [React Testing Library Tutorial](https://www.youtube.com/watch?v=T2sv8jXoP4s)

---

## Contributing

When adding new features:

1. **Write tests first** (TDD approach) or alongside the feature
2. **Ensure tests pass** before submitting PR
3. **Maintain coverage** - don't decrease overall coverage
4. **Update this document** if adding new testing patterns

---

## Troubleshooting

### Backend

**Issue**: Tests fail with database connection error
```bash
# Solution: Ensure PostgreSQL is running and test DB exists
createdb proposal_platform_test
cd backend && npx prisma migrate deploy
```

**Issue**: Tests timeout
```bash
# Solution: Increase timeout in jest.config.js
testTimeout: 10000 // 10 seconds
```

### Frontend

**Issue**: Tests fail with "Not implemented: HTMLFormElement.prototype.submit"
```bash
# Solution: This is a known JSDOM limitation, mock it in setupTests.ts
```

**Issue**: Cannot find module errors
```bash
# Solution: Clear Jest cache
npm test -- --clearCache
```

---

## Summary

- **Backend**: 4 test files, 100+ test cases
- **Frontend**: 6 test files, 80+ test cases
- **Total Coverage**: 75%+ across both backend and frontend
- **Test Execution Time**: ~30 seconds total

Keep tests fast, focused, and maintainable. Happy testing! 🎯
