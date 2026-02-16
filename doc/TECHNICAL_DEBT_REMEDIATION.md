# Technical Debt Cleanup Proposal

## Goal Description
Improve type safety, maintainability, and code quality by addressing high-priority technical debt identified in the `mobile-garage-door` codebase.

## User Review Required
> [!IMPORTANT]
> The codebase currently relies heavily on `any` types, particularly in form handling and API interactions. Eliminating these will require strict adherence to the generated `payload-types.ts`.

> [!WARNING]
> We will be establishing a pattern for strict typing. This might cause initial build errors that will need to be resolved by fixing the underlying type mismatches.

## Proposed Changes

### 1. Type Safety & Payload Integration (`src/components`, `src/hooks`)
- **Objective**: Remove usage of `any` in critical components and hooks.
- **Action**:
    - Import strict types from `src/payload-types.ts` (e.g., `Project`, `Media`).
    - Update `ProjectForm.tsx` to use `Project` type instead of `any` for `initialData`.
    - Create a strict `APIError` interface to replace `catch (e: any)`.
    - Fix `useSquarePayment.ts` to type the Square Web Payments SDK objects (or create a declaration file if the library lacks them).

#### [MODIFY] [ProjectForm.tsx](file:///c:/dev/mobile-garage-door/src/components/admin/projects/ProjectForm.tsx)
- Replace `initialData?: any` with `initialData?: Project`.
- Properly type `extractText` using Lexical types (available from `@payloadcms/richtext-lexical`).

#### [MODIFY] [ScheduleStep.tsx](file:///c:/dev/mobile-garage-door/src/components/booking/ScheduleStep.tsx)
- Replace `updateField`'s `value: any` with a union of allowed types.

### 2. Design System & CSS (`tailwind.config.ts`, `globals.css`)
- **Objective**: Functionally standardize colors and reduce manual arbitrary value usage (e.g., `bg-[#34495e]/30`).
- **Action**:
    - Extract repeated hex codes into `tailwind.config.ts` theme colors (e.g., `primary`, `surface-dark`, `accent-gold`).
    - Replace inline arbitrary values in `ProjectForm.tsx` and other admin components with these new semantic utility classes.

### 3. State & Logic Refactoring
- **Objective**: Improve data flow and reduce prop drilling.
- **Action**:
    - In `ProjectForm.tsx`, `handleSubmit` manually constructs `FormData`. We should ensure this aligns with Next.js Server Actions patterns and validation.
    - Introduce `zod` schemas for client-side form validation before submission (already present in `node_modules`).

## Verification Plan

### Automated Tests
- Run `npm run type-check` (tsc) to verify that replacing `any` hasn't introduced regression errors.
- **New Test**: Create a basic smoke test for the build process.

### Manual Verification
- **Admin Panel**: Navigate to `/admin/projects/create` and verify the `ProjectForm` still renders and submits correctly.
- **UI Check**: Verify that the new Tailwind color classes visually match the previous hardcoded hex values.
