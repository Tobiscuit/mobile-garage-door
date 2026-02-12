# Codebase Modernization & Refactoring

## 1. Updated Libraries (2026 Standards)
- **Square**: Updated to v44+ (Latest).
- **Postgres (pg)**: Updated to v8.18+.
- **GraphQL**: Updated to v16.12+.
- **tsx**: Updated to v4.21+.

## 2. Architectural Overhaul
The codebase has been refactored to follow a clean, modular architecture separating View, State, and Data layers.

### **Pages Refactored**
- **Contact Page** (`src/app/(site)/contact/page.tsx`):
    - Redesigned with a dynamic `ContactHero` component.
    - **Fixes**: Removed distracting gradient, refined Contractor/Partner messaging logic.
    - Aligned with "Techno-Hero" aesthetic (Charcoal Blue, Golden Yellow, Industrial patterns).
    - Uses overlapping "Command Center" layout.
- **Booking Page** (`src/app/(site)/book-service/page.tsx`):
    - Decomposed into `ContactStep`, `IssueStep`, `ScheduleStep`, `PaymentStep`.
- **Portal & Dashboard**:
    - Decomposed into specialized components.
    - Data fetching moved to Service Layer.

## 3. Pending Items
- **Database Connection**: The build failed due to missing local Postgres credentials. Ensure `DATABASE_URI` is set in your environment before running migrations.
- **Schema**: If `guestPassword` field does not exist in your Payload `users` collection, run `payload migrate` after setting up the DB connection.
