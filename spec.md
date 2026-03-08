# Gobinath Hotel POS

## Current State
- Full POS app with Login, Branch Select, Dashboard, Billing, Payment, Bill Preview, Menu Management, Reports, Employees, Settings.
- Employee module: Employee cards with auto-generated ID, name, mobile, address, role (fixed enum), salary type (Monthly/Daily), salary amount, advance tracking (amount + date + reason), salaryPaid boolean status toggle. Financial summary shows total employees, total salary expense, total advance given, pending salary count.
- Employee data stored in localStorage as `pos_employees`.
- Screen type enum has: login, branch-select, dashboard, billing, payment, bill-preview, menu, reports, employees, settings.
- Sidebar nav items built from `navItems` array based on role.

## Requested Changes (Diff)

### Add
1. **Employee form: Date of Join field** – new `dateOfJoin` string (YYYY-MM-DD) on Employee type; show in card as "Joined: DD MMM YYYY".
2. **Employee form: customizable Role** – change `role` from fixed enum to free-text string. Keep preset suggestions (Waiter, Cook, Cleaner, Cashier, Manager) but allow owner to type a custom role. Employee card shows role as a badge.
3. **Employee form: manual Employee ID** – allow owner to optionally override the auto-generated Employee ID at add time.
4. **Employee card: show Date of Join** – add a "Joined" row to the card info display.
5. **New screen: `money-management`** – complete new module accessible from sidebar (owner only).
6. **Sidebar: Money Management nav item** – Wallet/DollarSign icon, label "Money Management", navigates to `money-management` screen.
7. **Dashboard MODULE_CONFIG: add Money Management card**.
8. **Money Management module** with the following sub-features:
   - **Dashboard summary cards** (top row): Total Employees, Total Salary Paid Today, Total Salary Paid This Month, Total Advance Given, Pending Salary Balance.
   - **Daily Salary Payment recording**: for Daily salary employees – record a payment entry (employee, date, amount, payment mode Cash/Online). Each entry stored as `SalaryPayment`.
   - **Monthly Salary Payment recording**: for Monthly salary employees – record monthly salary (employee, month, salary amount, payment date, payment mode Cash/Online). Each entry stored as `SalaryPayment`.
   - **Advance Payment recording**: standalone advance recording panel (separate from the Employee cards). Fields: employee, advance amount, date, payment mode Cash/Online, notes. Stored in employee advances array.
   - **Remaining Salary Balance per employee**: computed as Salary - Total Advance Taken - Total Salary Paid. Shown per employee row: Salary Amount, Total Advance, Salary Paid, Remaining Balance.
   - **Salary History**: unified timeline per employee showing all salary payments and advances chronologically. Type label: "Advance" or "Salary". Format: "DD MMM – Type – ₹Amount – Mode".
   - **Salary Report Download**: PDF download (using `window.print()` with a print-only report div) and CSV/Excel-like download using Blob. Filters: date range, employee, branch. Report columns: Employee Name, Salary Type, Salary Amount, Advance Taken, Salary Paid, Remaining Balance, Payment Mode, Payment Date.
   - **Tab navigation inside module**: tabs for Overview, Pay Salary, Pay Advance, History, Report.

### Modify
1. **Employee type**: add `dateOfJoin: string` field; change `role` from enum to `string`. Add `salaryPayments: SalaryPayment[]` to Employee (or keep SalaryPayments in separate localStorage key indexed by employee id).
2. **Employee card UI**: show dateOfJoin. Show customizable role badge (keep color by known roles, fallback for custom). Replace advance-only history with full payment history when Money Management screen is used.
3. **App state**: add `screen: "money-management"` to Screen type; add `salaryPayments` state; add to `showNav` array.
4. **AppShell PAGE_TITLES**: add entry for `money-management`.
5. **Existing EmployeesScreen Add Employee form**: add dateOfJoin field, change role to combobox-style input (select from list OR type custom), allow manual override of Employee ID.
6. **initializeData**: update seed employee data with dateOfJoin field.
7. **navItems**: add money-management nav item (owner only).

### Remove
- Nothing removed; all existing screens preserved.

## Implementation Plan
1. Add `SalaryPayment` interface: `{ id, employeeId, type: "Salary" | "Advance", salaryType: "Monthly" | "Daily", month?: string, amount, date, paymentMode: "Cash" | "Online", notes?: string, createdAt }`.
2. Update `Employee` interface: add `dateOfJoin: string`, change `role` to `string`, add `salaryPayments: SalaryPayment[]` (or keep in a separate state array – use separate state `salaryPayments: SalaryPayment[]` stored in `pos_salary_payments` for cleaner separation).
3. Update `Screen` type to include `"money-management"`.
4. Update `initializeData` to seed `pos_salary_payments: []` and add `dateOfJoin` to seed employees.
5. Update `ROLE_COLORS` to handle string roles with fallback.
6. Update `EmployeesScreen` Add Employee form: dateOfJoin input, role combobox (datalist or manual input with preset suggestions), optional manual employeeId input.
7. Update employee card to show dateOfJoin, updated role badge.
8. Add `salary-payments` localStorage sync effect.
9. Add `MoneyManagementScreen` component with 5 tabs:
   - **Overview**: 5 summary stat cards + employee salary table (name, salary, advance, paid, remaining, status badge).
   - **Pay Salary**: form to select employee (filtered by salary type), fill payment fields, submit creates SalaryPayment record.
   - **Pay Advance**: form to select employee, fill advance fields, updates employee.advances and creates SalaryPayment record of type Advance.
   - **History**: employee selector + timeline list of all SalaryPayments sorted descending.
   - **Report**: date range + employee filter + branch filter + generate table + PDF print button + CSV download button.
10. Add MoneyManagement to sidebar navItems (owner), showNav array, AppShell PAGE_TITLES, and MODULE_CONFIG.
11. Wire MoneyManagementScreen in App render with all required state props.
