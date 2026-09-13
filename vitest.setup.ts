// jest-dom 7 ships a vitest-specific entry that registers its matchers on
// vitest's `Assertion` type. Importing the bare package only patches expect at
// runtime, so `toBeInTheDocument` / `toHaveAttribute` type-checked as missing.
import '@testing-library/jest-dom/vitest';
