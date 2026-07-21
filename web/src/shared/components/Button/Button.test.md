# Button Component Tests

This document describes the test suite for the Button component.

## Test Coverage

The Button component test suite covers the following areas:

### 1. Rendering
- ✅ Renders children correctly
- ✅ Renders with custom className
- ✅ Renders with multiple combined classNames

### 2. Button Types
- ✅ Default type="button"
- ✅ type="submit"
- ✅ type="reset"

### 3. Loading State
- ✅ Displays "Loading..." text when isLoading is true
- ✅ Disables button when isLoading is true
- ✅ Displays children when isLoading is false
- ✅ Displays children when isLoading is undefined

### 4. Disabled State
- ✅ Enabled by default
- ✅ Disabled when disabled prop is true
- ✅ Disabled when both disabled and isLoading are true

### 5. Event Handlers
- ✅ onClick handler works correctly
- ✅ onClick doesn't fire when disabled
- ✅ onClick doesn't fire when loading
- ✅ onMouseEnter handler works
- ✅ onFocus handler works
- ✅ onBlur handler works

### 6. HTML Attributes
- ✅ Spreads additional HTML attributes (data-testid, aria-label, id)
- ✅ Forwards ref correctly

### 7. Edge Cases
- ✅ Handles empty children
- ✅ Renders complex children (JSX elements)
- ✅ Handles number as children
- ✅ Prioritizes isLoading over complex children

### 8. Accessibility
- ✅ Accessible by role
- ✅ Supports aria-label
- ✅ Supports aria-describedby
- ✅ Indicates disabled state to screen readers
- ✅ Indicates loading state via disabled attribute

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Test Statistics

- **Total Tests**: 32
- **Test Categories**: 8
- **Coverage Areas**: Rendering, Types, States, Events, Accessibility, Edge Cases

## Dependencies

- `@testing-library/react` - React component testing utilities
- `@testing-library/jest-dom` - Custom Jest matchers for DOM
- `jest` - Testing framework
- `jest-environment-jsdom` - DOM environment for Jest

## Notes

- All tests follow React Testing Library best practices
- Tests focus on user behavior rather than implementation details
- Accessibility is tested to ensure the component is usable by all users
- Edge cases are covered to ensure robust behavior

