# Gobinath Hotel POS

## Current State
- Full POS app with Login, Branch Select, Dashboard, Billing, Payment, Bill Preview, Menu Management, Reports, Employees, and Settings screens.
- TopBar shows logo, hotel name, branch/role label, date/time, and logout button.
- TopBar does NOT have a "Change Branch" button or link.
- Module screens (Billing, Menu, Reports, Employees, Settings) have NO back button — navigation is only via the bottom nav bar.
- BranchSelectScreen is only reachable after Owner login.
- Dashboard is the central hub for owner navigation.

## Requested Changes (Diff)

### Add
- **"Change Branch" button in TopBar** (owner-only, near the date/time area): clicking it navigates to `branch-select` screen. Layout: `Sun, 8 Mar | 09:55 AM | Change Branch`
- **Back button on all module screens**: Billing, Menu Management, Reports, Employees, Settings. Placed in the top-left corner of each module page. Label: `← Back`. Navigates to Dashboard. Large, touch-friendly for mobile/tablet.

### Modify
- **TopBar**: When role === "owner", add a "Change Branch" clickable element after the date/time block. Use a subtle button style (e.g. a text link or small outlined button). Pass `onSwitchBranch` prop through to the TopBar and wire it up.
- **TopBar props**: The current TopBar receives `onSwitchBranch` but doesn't use it — wire it up now.
- **BillingScreen**: Add a back button (`← Back`) at the top-left that calls `onBack` (navigate to dashboard). Pass `onBack` prop from App.
- **MenuScreen**: Add a back button at the top-left. Pass `onBack` prop from App.
- **ReportsScreen**: Add a back button at the top-left. Pass `onBack` prop from App.
- **EmployeesScreen**: Add a back button at the top-left. Pass `onBack` prop from App.
- **GSTSettingsScreen**: Add a back button at the top-left. Pass `onBack` prop from App.
- **App**: Pass `onBack={() => setScreen("dashboard")}` to all module screens. Pass `onSwitchBranch={() => setScreen("branch-select")}` to TopBar and wire it through.
- **BranchSelectScreen**: When reached via "Change Branch" (owner already logged in), selecting a branch should update activeBranch and go to dashboard. This is already supported by the existing `onSelect` handler — no change needed.

### Remove
- Nothing removed.

## Implementation Plan
1. Update `TopBar` component:
   - Use the existing `onSwitchBranch` prop (it is already in the signature but unused in render).
   - When `role === "owner"`, render a "Change Branch" button/link after the date/time block in the right section. Style: small text button with a separator `|` divider, matching header foreground. Touch-friendly tap target (min 44px height).
2. Add `onBack` prop to `BillingScreen`, `MenuScreen`, `ReportsScreen`, `EmployeesScreen`, `GSTSettingsScreen`.
   - In each screen's header row (the `<div className="flex items-center justify-between">` or equivalent), prepend an `ArrowLeft` back button that calls `onBack`.
   - Back button: `h-11 w-11` min touch target, rounded-xl, visible on all screen sizes.
3. Wire up in `App`:
   - Pass `onBack={() => setScreen("dashboard")}` to all five module screens.
   - Confirm `onSwitchBranch={() => setScreen("branch-select")}` is passed to `TopBar` (it already is — just ensure TopBar renders it).
4. Add `data-ocid` markers to new interactive elements:
   - `topbar.change_branch_button`
   - `billing.back_button`, `menu.back_button`, `reports.back_button`, `employee.back_button`, `settings.back_button`
