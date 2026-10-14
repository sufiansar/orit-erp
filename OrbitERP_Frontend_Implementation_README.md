# Multi-Tenant B2B SaaS ERP — Frontend Implementation Plan

> **Purpose:** Build a polished, responsive, frontend-only SaaS ERP dashboard using **Next.js 16, TypeScript, Tailwind CSS, and shadcn/ui**. Follow this document in order, one step at a time. The result must be a coherent, navigable frontend that can later be connected to a real Express.js + PostgreSQL + Prisma backend.
>
> **Important:** This phase is frontend only. Do not build a backend, database, real authentication, payment processing, or real device integration. Use typed mock data and a small mock service layer. Clearly label simulated actions where appropriate.

---

## 0. Instructions for the AI coding agent

Work through the steps sequentially. Do not skip ahead or implement everything in one unstructured pass.

For every step:

1. Inspect the existing repository before changing it.
2. Keep the app runnable; do not leave broken imports or placeholder routes.
3. Implement the step fully, including loading, empty, error, and success states where relevant.
4. Run the available checks (`lint`, `typecheck`, `build`) and fix errors before proceeding.
5. Update this README’s **Progress checklist**.
6. Avoid unnecessary dependencies and avoid rewriting working code without a reason.
7. Use reusable components and consistent design tokens.
8. Do not claim a backend action succeeded. Mock actions should visibly behave as simulations.
9. If a decision is not specified, choose a sensible, consistent default and continue.
10. At the end, provide a concise summary of completed work, routes, checks run, and known frontend-only limitations.

### Product concept

Build a multi-tenant cloud SaaS ERP called **OrbitERP** (keep the product name in one config/constants location so it can be changed easily).

Target users: international small and medium businesses.

Core product areas:

- Organization overview
- Employees and branches
- Attendance and shifts
- Leave requests and approvals
- Custom fields
- Workflow builder
- Module activation
- Roles and permissions
- Subscription and usage
- Organization settings
- SaaS platform admin overview

The UI should feel like a premium, modern B2B product: calm neutral surfaces, clear typography, restrained indigo/blue accent, excellent spacing, subtle borders, useful charts, and strong information hierarchy. Avoid a generic landing-page-only result. The primary deliverable is a complete, usable application dashboard.

---

## 1. Technology requirements

Use:

- **Next.js 16** with App Router
- **TypeScript** with strict mode
- **Tailwind CSS**
- **shadcn/ui** components
- **Lucide icons** via the icon package already used by shadcn/ui
- **Recharts** for charts if compatible with the installed setup
- **React Hook Form + Zod** for forms when useful
- **date-fns** for date formatting if needed
- **Sonner** (or shadcn toast equivalent) for toast notifications

Use the package manager already present in the repository. If starting from an empty directory, use npm unless the project already specifies another package manager.

Do not downgrade Next.js to an earlier major version. Use the current compatible stable versions available in the environment, and verify installed versions rather than assuming commands or APIs.

### App Router conventions

- Use `src/app` if the repository uses a `src` directory; otherwise follow the existing convention.
- Use Server Components by default.
- Add `"use client"` only to components that need state, browser APIs, interactive controls, charts, or client-side event handlers.
- Do not access `window`, `document`, or browser storage during server rendering.
- Use route groups/layouts where they improve organization.
- Use semantic HTML, accessible labels, keyboard-friendly dialogs, and visible focus states.

---

## 2. Visual design system

Create a consistent design system before building pages.

### Brand direction

- Product: OrbitERP
- Visual style: premium, clean, trustworthy, modern B2B SaaS
- Base: warm/neutral white and slate surfaces
- Accent: indigo or blue
- Positive: green
- Warning: amber
- Destructive: red
- Borders: subtle, low-contrast
- Radius: consistent medium rounded corners
- Shadows: restrained; prefer borders and surface contrast over heavy shadows

### Layout

Desktop:
- Fixed/collapsible left sidebar, approximately 250–280px when expanded
- Main content area with a top header
- Content max-width appropriate for dashboards
- Comfortable spacing and responsive tables

Mobile:
- Sidebar becomes a Sheet/drawer
- Header keeps page title/context and primary actions accessible
- Tables may scroll horizontally or switch to compact cards
- Forms stack vertically
- Avoid horizontal overflow

### Shared UI elements

Implement reusable components for:

- `AppSidebar`
- `AppHeader`
- `PageHeader` (title, description, breadcrumbs, actions)
- `StatCard`
- `DataTable` or reusable table patterns
- `StatusBadge`
- `EmptyState`
- `ConfirmDialog`
- `SearchInput`
- `FilterBar`
- `FormSection`
- `SectionCard`
- `LoadingSkeleton`
- `ErrorState`
- `PageContainer`
- `OrganizationSwitcher`
- `UserMenu`
- `DateRangePicker` (simple and reliable; do not overbuild)
- `Pagination`

Use shadcn/ui primitives consistently. Avoid building custom versions of components that shadcn already provides unless a specific UX requirement needs it.

### Typography and content

- Use a readable sans-serif font supported by the project.
- Use consistent page title, section title, body, and muted text styles.
- Use realistic sample company and employee data.
- Do not use lorem ipsum.
- Format dates and numbers consistently. Provide a visible timezone/locale setting in organization settings; do not assume all customers are in Bangladesh.

---

## 3. Project structure

Adapt this structure to the existing repository; do not duplicate folders unnecessarily.

```text
src/
  app/
    (auth)/
      login/page.tsx
      forgot-password/page.tsx
    (app)/
      layout.tsx
      dashboard/page.tsx
      employees/page.tsx
      employees/[id]/page.tsx
      branches/page.tsx
      attendance/page.tsx
      shifts/page.tsx
      leave/page.tsx
      custom-fields/page.tsx
      workflows/page.tsx
      modules/page.tsx
      roles/page.tsx
      billing/page.tsx
      settings/
        general/page.tsx
        security/page.tsx
        notifications/page.tsx
      admin/
        overview/page.tsx
        organizations/page.tsx
    layout.tsx
    page.tsx
    globals.css
  components/
    layout/
    dashboard/
    employees/
    attendance/
    leave/
    customization/
    settings/
    shared/
    ui/                 # shadcn/ui generated components
  config/
    app.ts
    navigation.ts
  lib/
    utils.ts
    format.ts
    mock-api/
      client.ts
      employees.ts
      attendance.ts
      leave.ts
      organizations.ts
      workflows.ts
      modules.ts
  hooks/
  types/
    common.ts
    organization.ts
    employee.ts
    attendance.ts
    leave.ts
    workflow.ts
    module.ts
```

Keep route components relatively small. Move reusable UI and data logic into the relevant modules.

---

## 4. Step-by-step implementation sequence

### Step 1 — Inspect repository and establish baseline

- Inspect `package.json`, existing routes, styling, and installed dependencies.
- Identify whether the project is already a Next.js 16 app.
- Preserve existing working conventions.
- If empty, scaffold Next.js 16 with TypeScript, App Router, Tailwind, and ESLint.
- Ensure the initial app runs.
- Add or verify scripts for `dev`, `build`, `start`, and `lint`.
- Add a `typecheck` script if practical.

**Acceptance criteria**
- App starts without errors.
- TypeScript strict mode is enabled.
- No unnecessary duplicate setup is introduced.

### Step 2 — Install and configure shadcn/ui

- Initialize shadcn/ui using the current official setup compatible with the project.
- Configure CSS variables and theme tokens.
- Add only the components needed for the planned UX, such as:
  - button, input, label, textarea
  - card, badge, avatar
  - dropdown-menu, dialog, alert-dialog
  - sheet, sidebar (if supported by installed shadcn setup)
  - table, tabs, tooltip
  - select, checkbox, switch, radio-group
  - form, calendar/popover if needed
  - skeleton, separator, command
- Add icons.
- Verify components render correctly in light mode.
- Add a usable dark mode only if it can be done consistently without delaying core pages.

**Acceptance criteria**
- Design tokens are centralized.
- Components have consistent focus, disabled, hover, and error states.
- No inaccessible custom controls are introduced.

### Step 3 — Build the app shell and navigation

Create:
- Responsive sidebar
- Brand/logo area
- Organization switcher
- Main navigation grouped into:
  - Overview
  - People
  - Time & Attendance
  - Workflow & Customization
  - Organization
- Header with breadcrumbs/page context, global search affordance, notifications, help, and user menu
- Mobile navigation drawer
- Active route states
- Sidebar collapse/expand on desktop if practical

Navigation links:

- Overview → `/dashboard`
- Employees → `/employees`
- Branches → `/branches`
- Attendance → `/attendance`
- Shifts → `/shifts`
- Leave → `/leave`
- Custom fields → `/custom-fields`
- Workflows → `/workflows`
- Modules → `/modules`
- Roles & permissions → `/roles`
- Billing & usage → `/billing`
- General settings → `/settings/general`
- Security → `/settings/security`
- Notifications → `/settings/notifications`
- Platform admin → `/admin/overview`

Keep Platform Admin clearly separated from normal organization navigation. In the mock app, provide a demo role/context switch only if it is clearly labeled as a demo feature.

**Acceptance criteria**
- Every navigation item opens a real page.
- Current page is visually indicated.
- Sidebar and header work on mobile and desktop.
- No dead links.

### Step 4 — Create typed mock data and mock API layer

Create domain types and stable seed data for:
- Current organization
- Multiple organizations for the organization switcher
- Branches
- Employees
- Attendance records
- Shifts
- Leave requests
- Custom field definitions
- Workflow definitions
- Module catalog and tenant module states
- Roles and permissions
- Subscription and usage metrics

Create a mock service layer with typed functions such as:
- `listEmployees()`
- `getEmployee(id)`
- `createEmployee(input)`
- `updateEmployee(id, input)`
- `listAttendance(filters)`
- `listLeaveRequests(filters)`
- `updateLeaveStatus(id, status)`
- `listWorkflows()`
- `saveWorkflowDraft(input)`
- `toggleModule(moduleKey, enabled)`

Requirements:
- Keep mock data separate from components.
- Use predictable data; avoid random data generated during render.
- Simulate short latency only if useful, without making the app feel slow.
- Use in-memory state for interactive demo behavior.
- Do not imply changes persist across reloads unless persistence is deliberately implemented.
- Add clear comments that the mock API will later be replaced with real API calls.

**Acceptance criteria**
- Pages do not hardcode large datasets inside JSX.
- Types are shared and reusable.
- UI can be connected to a real backend without rewriting all page components.

### Step 5 — Build the organization dashboard

Design a polished dashboard with:

- Greeting and organization context
- Date range selector
- KPI cards:
  - Total employees
  - Present today
  - Pending leave requests
  - Attendance rate
- Attendance trend chart
- Employee distribution by branch or department
- Recent activity list
- Pending approvals panel
- Quick actions:
  - Add employee
  - View attendance
  - Review leave
  - Configure modules

Use realistic mock values and clear chart labels/tooltips. Include responsive chart behavior.

**Acceptance criteria**
- Dashboard has a clear visual hierarchy.
- Cards and charts are responsive.
- Dates and chart labels are readable.
- Quick actions navigate to functional pages or open working dialogs.

### Step 6 — Employees directory and employee details

Employees page:
- Search by name, email, employee code
- Filter by branch, department, status
- Table with avatar/initials, name, code, department, branch, status, joining date
- Pagination
- Add employee dialog or page
- Edit employee
- View employee details
- Empty state and no-results state

Employee details page:
- Profile header
- Contact and employment information
- Branch/department details
- Attendance summary
- Leave summary
- Custom fields section
- Edit action

Form fields should be validated with Zod. Use accessible form labels and useful inline errors.

**Acceptance criteria**
- Search and filters work on mock data.
- Add/edit actions update the mock state.
- Details page handles an unknown employee ID gracefully.
- Forms have loading/submitting and success/error feedback.

### Step 7 — Branches and organization structure

Branches page:
- Branch cards or table
- Branch name, code, location, timezone, employee count, status
- Create/edit branch dialog
- Branch detail affordance
- Search/filter
- Branch timezone display

Organization structure:
- Department list and manager
- Employee count
- Create/edit department if included in scope

**Acceptance criteria**
- Branch creation/editing works in the demo state.
- Branch counts are derived from data where practical.
- Timezone is visible and not hardcoded globally.

### Step 8 — Attendance and shifts

Attendance page:
- Daily attendance overview
- Date selector
- Branch, department, status filters
- Check-in, check-out, worked hours, late/early status
- Attendance summary cards
- Export CSV button that produces a real client-side CSV from displayed/filtered data
- Device status panel with mock devices
- Device sync status and last-sync timestamp
- Empty and loading states

Shifts page:
- Shift list
- Start/end time
- Grace period
- Break duration
- Applicable branches/departments
- Create/edit shift dialog

Device integration UI:
- Show supported integration status as **demo data**
- Include a “Connect device” flow with fields such as device name, brand, branch, connection type
- Do not connect to real devices or expose network credentials in the browser
- Include a clear “Backend integration required” note

**Acceptance criteria**
- Filters change the displayed records.
- CSV export downloads a valid file.
- Shift form validates time and grace-period fields.
- No fake real-time/device connectivity claims.

### Step 9 — Leave management

Leave page:
- Tabs for All, Pending, Approved, Rejected
- Employee, leave type, date range, status
- Request details drawer/dialog
- Approve/reject actions with confirmation
- Leave balance summary
- Add leave request for demo purposes

**Acceptance criteria**
- Tabs and filters work together.
- Approve/reject updates mock state.
- Confirmation and toast feedback are shown.
- Status changes are visually clear.

### Step 10 — Custom fields builder

Create a usable custom field management interface.

Features:
- Entity selector (Employee, Branch, Department)
- Field list with label, key, type, required, status
- Create/edit field dialog
- Supported types: text, number, date, boolean, select
- Required toggle
- Select options editor
- Active/inactive toggle
- Preview of how the field will render in a form
- Reorder fields if feasible

Validation:
- Field key must be unique per entity in the current tenant.
- Field key should be normalized (e.g. `cost_center`).
- Select fields require at least one option.
- Existing fields should not be silently deleted when deactivated.

**Acceptance criteria**
- Create/edit/deactivate flows work in mock state.
- Preview reflects the selected type and settings.
- Validation errors are clear.
- Page explains that values and definitions are currently demo data.

### Step 11 — Workflow builder

Build a visual but restrained workflow editor. Avoid a complex drag-and-drop canvas unless the basic experience is already complete.

Initial supported workflow:
- Name and description
- Trigger selector (Leave submitted, Expense submitted, Purchase request submitted)
- Ordered approval steps
- Approver type (Manager, HR, Organization Admin, Specific role)
- Add/remove/reorder steps
- Draft/published status
- Workflow summary/preview panel
- Save draft and publish confirmation

Use structured forms and step cards. Do not execute arbitrary user-provided code or expressions.

**Acceptance criteria**
- Users can create/edit a workflow draft.
- Steps can be added and removed.
- Publish action changes mock status after confirmation.
- Published workflow is visibly distinguished from draft.
- UI communicates that execution requires backend support.

### Step 12 — Module activation catalog

Create a module catalog with cards for:
- Employee Management
- Attendance
- Leave Management
- Workflows
- Custom Fields
- Payroll (coming soon/demo)
- Inventory (coming soon/demo)
- Finance (coming soon/demo)

Each card:
- Icon
- Description
- Enabled/disabled state
- Included/add-on/coming-soon badge
- Configure action where applicable
- Enable/disable switch with confirmation for modules that affect data

Show plan restrictions as demo entitlements. Do not present mock subscription limits as real billing data.

**Acceptance criteria**
- Module toggles update the mock state.
- Disabled modules are reflected in navigation or show an appropriate disabled state.
- Core modules cannot be disabled if doing so would break the demo’s navigation; explain or handle this gracefully.
- Subscription restrictions are clearly marked as demo.

### Step 13 — Roles and permissions

Create:
- Roles list
- Role detail/editor
- Permission matrix grouped by module
- Read/create/update/delete/export permissions
- Branch scope selector (all branches or selected branches)
- Create custom role
- Assign role to demo users/members

Important:
- The UI is a prototype only; backend must enforce every permission.
- Avoid implying client-side hiding is security.
- Provide a reset/demo state option if useful.

**Acceptance criteria**
- Permission toggles update mock state.
- Role editor has save/cancel behavior.
- Branch scope is visible.
- Destructive changes require confirmation.

### Step 14 — Billing and usage

Build a frontend-only billing page:
- Current plan card
- Usage meters for employees, branches, storage, and devices
- Plan comparison cards
- Billing history table with sample invoices
- Upgrade/downgrade CTA that opens a demo confirmation dialog
- Payment method placeholder
- Clearly mark all billing values as sample data

Do not collect real card data or pretend to charge a payment method.

**Acceptance criteria**
- Usage bars are accessible and have textual values.
- Plan CTA works as a demo interaction.
- Billing history table is responsive.
- No real payment processing.

### Step 15 — Settings

General settings:
- Organization name, logo placeholder, website
- Country, locale, timezone, week start
- Date format and default currency
- Save/cancel

Security:
- Session/device list (mock)
- MFA status (mock)
- Password/security settings affordance
- Active sessions with revoke confirmation (demo only)

Notifications:
- Email/in-app notification preferences
- Categories such as attendance, leave, workflow, security
- Save/cancel

**Acceptance criteria**
- Settings forms are validated.
- Save actions update demo state and show feedback.
- Locale/timezone options are not limited to Bangladesh.
- Security controls are labeled as simulated.

### Step 16 — SaaS platform admin pages

Create a separate Platform Admin experience:
- Platform overview KPIs: organizations, active tenants, trial tenants, subscription status
- Organization list with search and status filters
- Organization detail drawer/page
- Plan/status indicators
- Recent platform events
- Tenant suspend/reactivate confirmation (mock only)

Keep platform-level administration visually and logically separate from tenant organization administration.

**Acceptance criteria**
- Platform admin navigation is distinct.
- Organization filters work.
- Suspend/reactivate actions require confirmation and update mock state.
- UI warns that real privileged actions need server-side authorization and audit logging.

### Step 17 — Global UX polish

Implement:
- Loading skeletons for data-heavy pages
- Empty states and no-results states
- Error boundaries or route-level error UI where appropriate
- Not-found page
- Toast feedback
- Confirmation dialogs for destructive actions
- Consistent badges and status colors
- Search/filter clear actions
- Responsive behavior at mobile, tablet, and desktop sizes
- Accessible focus states and keyboard navigation
- Consistent date/number formatting
- Light theme polished end-to-end
- Dark theme only if consistently implemented

Do a visual pass on every route. Avoid pages that are just a title and a blank card.

**Acceptance criteria**
- No page is unfinished or visually inconsistent.
- All important actions have a visible outcome.
- No console errors during normal navigation.
- No horizontal overflow at common viewport widths.

### Step 18 — Final quality gate

Run:
- Lint
- TypeScript typecheck
- Production build
- Route-by-route manual review
- Responsive review
- Accessibility spot checks
- Search/filter/form interaction checks

Check for:
- Broken links
- Runtime errors
- Missing keys
- Uncontrolled/controlled input warnings
- Invalid date formatting
- Mock actions that imply real backend success
- Unused components/dependencies
- Tenant data accidentally shared across organization switch demo state

**Final deliverable**
- Fully navigable frontend
- All routes listed above implemented
- Consistent shadcn/ui design system
- Typed mock API layer
- Functional demo interactions
- Responsive layout
- No backend dependency
- README updated with setup instructions, route map, implemented features, and backend integration notes

---

## 5. Frontend/backend boundary

Keep backend integration straightforward.

Create a single API client abstraction, for example:

```ts
// lib/api/client.ts
export type ApiError = {
  code: string;
  message: string;
};

export async function apiRequest<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  // Frontend phase: mock services are used by pages.
  // Later: implement fetch, auth/session handling, and error mapping here.
  throw new Error("Real API client is not connected yet.");
}
```

Do not call this placeholder from pages during the frontend-only phase. Use typed mock services behind interfaces so they can later be replaced with real API implementations.

Suggested environment variable for future integration:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api/v1
```

Never put secrets, database URLs, service credentials, or private API keys in `NEXT_PUBLIC_*` variables.

### Backend handoff notes

When the backend phase begins:
- Keep UI components independent from Prisma types.
- Define frontend DTOs explicitly.
- Map API responses to UI models in the service layer.
- Add loading/error states to every API-backed page.
- Replace mock services incrementally, module by module.
- Use server-validated permissions and subscription entitlements.
- Implement real authentication/session management before exposing customer data.
- Add pagination and filtering on the server for large datasets.
- Use idempotency for sensitive write operations.
- Keep tenant context and authorization server-side.

---

## 6. Definition of done

The frontend is complete only when:

- [x] All listed routes render and are navigable.
- [x] Dashboard has useful charts and KPIs.
- [x] Employee CRUD works against mock state.
- [x] Branch management works against mock state.
- [x] Attendance filters and CSV export work.
- [x] Leave approval/rejection works against mock state.
- [x] Custom field create/edit/deactivate works.
- [x] Workflow draft and publish demo works.
- [x] Module activation works in mock state.
- [x] Role/permission editor works in mock state.
- [x] Billing page is clearly marked as sample/demo.
- [x] Organization settings work in mock state.
- [x] Platform admin pages work in mock state.
- [x] Responsive navigation and layout work.
- [x] Empty/loading/error states exist where relevant.
- [x] Lint, typecheck, and production build pass.
- [x] No real backend, payment, or device connection is falsely claimed.

## 7. Progress checklist

The AI agent must update this checklist as it completes work.

- [x] Step 1 — Repository inspection and baseline
- [x] Step 2 — shadcn/ui and design tokens
- [x] Step 3 — App shell and navigation
- [x] Step 4 — Typed mock data and mock API
- [x] Step 5 — Dashboard
- [x] Step 6 — Employees
- [x] Step 7 — Branches
- [x] Step 8 — Attendance and shifts
- [x] Step 9 — Leave management
- [x] Step 10 — Custom fields
- [x] Step 11 — Workflow builder
- [x] Step 12 — Module activation
- [x] Step 13 — Roles and permissions
- [x] Step 14 — Billing and usage
- [x] Step 15 — Settings
- [x] Step 16 — Platform admin
- [x] Step 17 — UX polish
- [x] Step 18 — Final quality gate

---

## 8. Setup instructions to include in the finished project

The finished project README should include the actual commands appropriate to the repository. At minimum, document:

```bash
npm install
npm run dev
```

And the quality checks:

```bash
npm run lint
npm run typecheck
npm run build
```

If a script does not exist, add it or document the equivalent command. Do not leave setup instructions that fail.

---

## 9. Final instruction to the AI agent

Build the application as a cohesive product, not a collection of disconnected mockup pages. Follow the steps in this document in order. Prioritize correctness, usability, accessibility, responsive design, and a clean frontend/backend boundary.

Do not stop after creating the dashboard. Complete every required route and interaction, then run the final quality gate. If context or time is limited, finish the current step cleanly, update the progress checklist, and continue from the next unchecked step in a later run.
