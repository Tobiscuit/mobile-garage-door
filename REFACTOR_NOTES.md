# Codebase Modernization & Refactoring

## 1. Updated Libraries (2026 Standards)
- **Square**: Updated to v44+ (Latest).
- **Postgres (pg)**: Updated to v8.18+.
- **GraphQL**: Updated to v16.12+.
- **tsx**: Updated to v4.21+.

## 2. Architectural Overhaul:
The `src/app/(site)/book-service/page.tsx` was a "God Component". It has been refactored into a clean, modular architecture:

- **View Layer**: Decomposed into small, single-purpose components in `src/components/booking/`:
    - `ContactStep.tsx`
    - `IssueStep.tsx`
    - `ScheduleStep.tsx`
    - `PaymentStep.tsx`
- **State Management**: Extracted to `src/hooks/useBookingForm.ts`. This also fixes the `guestPassword` type error by ensuring proper initialization.
- **Integration Layer**: Extracted Square logic to `src/hooks/useSquarePayment.ts`.

## 3. Clean Architecture: Server Actions
The `src/app/actions/booking.ts` file has been refactored to be a pure orchestrator. Business logic has been moved to a new Service Layer:

- **Square Service**: `src/services/squareService.ts` handles payment processing using the modern `paymentsApi.createPayment` method.
- **Customer Service**: Customer lookup/creation logic is now encapsulated (currently as a helper in the action, ready for extraction to `src/services/customerService.ts` if needed).

## 4. Pending Items
- **Database Connection**: The build failed due to missing local Postgres credentials. Ensure `DATABASE_URI` is set in your environment before running migrations.
- **Schema**: If `guestPassword` field does not exist in your Payload `users` collection, run `payload migrate` after setting up the DB connection.
