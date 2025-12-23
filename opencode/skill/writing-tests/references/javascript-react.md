# JavaScript/React Testing Patterns

Language-specific patterns for testing JavaScript and React applications with Jest, Vitest, React Testing Library, and Playwright.

## Contents

- [Integration Test Pattern (React Testing Library)](#integration-test-pattern-react-testing-library)
- [E2E Test Pattern (Playwright)](#e2e-test-pattern-playwright)
- [Query Strategy](#query-strategy)
- [String Management](#string-management)
- [React-Specific Anti-Patterns](#react-specific-anti-patterns)
- [Async Waiting Patterns](#async-waiting-patterns)
- [Tooling Quick Reference](#tooling-quick-reference)
- [Setup Patterns](#setup-patterns)

## Integration Test Pattern (React Testing Library)

```javascript
describe("Feature Name", () => {
  // Real state/providers, not mocks
  const setup = (initialState = {}) => {
    return render(<Component />, {
      wrapper: ({ children }) => (
        <StateProvider initialState={initialState}>{children}</StateProvider>
      ),
    });
  };

  it("should show result when user performs action", async () => {
    setup({ items: [] });

    // Semantic query (role/label/text)
    const button = screen.getByRole("button", { name: /add item/i });
    await userEvent.click(button);

    // Assert on UI output
    await waitFor(() => expect(screen.getByText(/item added/i)).toBeVisible());
  });
});
```

## E2E Test Pattern (Playwright)

```javascript
test("should complete workflow when user takes action", async ({ page }) => {
  await page.goto("/dashboard");

  // Given: precondition
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();

  // When: user action
  await page.getByRole("button", { name: "Add Item" }).click();

  // Then: expected outcome
  await expect(page.getByText("Item added successfully")).toBeVisible();
});
```

## Query Strategy

**Use semantic queries (order of preference):**

1. `getByRole('button', { name: /submit/i })` - Accessibility-based
2. `getByLabelText(/email/i)` - Form labels
3. `getByText(/welcome/i)` - Visible text
4. `getByPlaceholderText(/search/i)` - Input placeholders

**Avoid:**

- `getByTestId` - Implementation detail
- CSS selectors - Brittle, breaks during refactoring
- Internal state queries - Not user-observable

## String Management

**Use source constants, not hard-coded strings:**

```javascript
// Good - References actual constant
import { MESSAGES } from "@/constants/messages";
expect(screen.getByText(MESSAGES.SUCCESS)).toBeVisible();

// Bad - Hard-coded, breaks when copy changes
expect(screen.getByText("Action completed successfully!")).toBeVisible();
```

## React-Specific Anti-Patterns

### Testing Mock Behavior

```typescript
// BAD: Testing mock existence, not real behavior
test("renders sidebar", () => {
  render(<Page />);
  expect(screen.getByTestId("sidebar-mock")).toBeInTheDocument();
});

// GOOD: Test real component with semantic query
test("renders sidebar", () => {
  render(<Page />); // Don't mock sidebar
  expect(screen.getByRole("navigation")).toBeInTheDocument();
});
```

### Mocking Internal Components

```typescript
// BAD: Mock internal dependencies
vi.mock("./Sidebar", () => ({
  Sidebar: () => <div data-testid="sidebar-mock" />,
}));

// GOOD: Use real components, mock at system boundaries
// Only mock external APIs, not internal components
```

## Async Waiting Patterns

Use framework-provided waiting utilities, not arbitrary timeouts:

```typescript
// BAD: Guessing at timing
await new Promise((r) => setTimeout(r, 500));
expect(screen.getByText("Done")).toBeVisible();

// GOOD: Wait for the actual condition
await waitFor(() => expect(screen.getByText("Done")).toBeVisible());

// GOOD: Playwright auto-waits
await expect(page.getByText("Done")).toBeVisible();
```

For flaky test debugging, invoke `Skill(ce:condition-based-waiting)`.

## Tooling Quick Reference

| Tool                  | Purpose            | Best For                          |
| --------------------- | ------------------ | --------------------------------- |
| Jest                  | Test runner        | Unit and integration tests        |
| Vitest                | Test runner        | Vite projects, faster than Jest   |
| React Testing Library | Component testing  | Integration tests with real DOM   |
| Playwright            | Browser automation | E2E tests, cross-browser          |
| Cypress               | Browser automation | E2E tests, time-travel debugging  |
| MSW                   | API mocking        | Mock fetch/axios at network level |

## Setup Patterns

### Jest + RTL Setup

```javascript
// jest.setup.js
import "@testing-library/jest-dom";

// Clear mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
});
```

### Vitest + RTL Setup

```javascript
// vitest.setup.ts
import "@testing-library/jest-dom/vitest";

beforeEach(() => {
  vi.clearAllMocks();
});
```

### Playwright Setup

```javascript
// playwright.config.js
export default {
  testDir: "./e2e",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
};
```
