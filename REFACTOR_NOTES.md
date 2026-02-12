# Codebase Modernization & Refactoring

## 1. Updated Libraries (2026 Standards)
- **Square**: Updated to v44+ (Latest).
- **Postgres (pg)**: Updated to v8.18+.
- **GraphQL**: Updated to v16.12+.
- **tsx**: Updated to v4.21+.

## 2. Architectural Overhaul
The codebase has been refactored to follow a clean, modular architecture separating View, State, and Data layers.

### **Pages Refactored**
- **Booking Page** (`src/app/(site)/book-service/page.tsx`):
    - Decomposed into `ContactStep`, `IssueStep`, `ScheduleStep`, `PaymentStep`.
    - State managed by `useBookingForm` hook.
    - Square logic in `useSquarePayment` hook.
- **Portal Dashboard** (`src/app/(site)/portal/page.tsx`):
    - Decomposed into `PortalHeader`, `ActiveRequestList`, `ServiceHistory`, `AccountSidebar`.
    - Data fetching moved to `serviceRequestService`.
- **Admin Dashboard** (`src/app/(site)/dashboard/page.tsx`):
    - Decomposed into `KPIGrid`, `QuickActions`.

### **New Service Layer (`src/services/`)**
Logic has been moved out of Server Actions and Components into dedicated services:
- **`squareService.ts`**: Handles payment processing with modern SDK methods.
- **`serviceRequestService.ts`**: Handles ticket data fetching.
- **`userService.ts`**: Handles user profile operations.

### **New Hooks (`src/hooks/`)**
- **`useBookingForm.ts`**: Form state management.
- **`useSquarePayment.ts`**: Payment integration.
- **`useMobileMenu.ts`**: shared logic for responsive navigation.

## 3. Pending Items
- **Database Connection**: The build failed due to missing local Postgres credentials. Ensure `DATABASE_URI` is set in your environment before running migrations.
- **Schema**: If `guestPassword` field does not exist in your Payload `users` collection, run `payload migrate` after setting up the DB connection.
