# UI Testing Guide

## Quick Start

-   **Run All Tests (Headless)**:
    ```bash
    npm run test
    ```

-   **Interactive Mode (Best for Dev)**:
    ```bash
    npm run test:ui
    ```
    Opens a GUI where you can run specific tests, see traces, and debug Step-by-Step.

-   **Fast Check (Skip Visuals)**:
    ```bash
    npm run test:fast
    ```

## Key Tests

-   `tests/visit-flow.spec.ts`: The main "Happy Path" (creating a visit).
-   `tests/backup-restore.spec.ts`: Verifies data safety (Export -> Wipe -> Import).
-   `tests/security.spec.ts`: Checks XSS protocols and sanitization.

## Best Practices

1.  **Don't rely on animations**: We disable them globally in `playwright.config.ts`.
2.  **Use `data-testid`**: If a text locator is flaky, add `data-testid="my-element"` to the component.
3.  **Keep it clean**: Tests should clean up after themselves (or rely on `beforeEach` resets).
