# Gobinath Hotel POS

## Current State

A full-stack POS app built with React + TypeScript on the frontend, Motoko backend. The frontend is a single `App.tsx` file with all screens: Login, Branch Select, Dashboard, Billing, Payment, Bill Preview, Menu Management, Reports, Employees, Settings.

Current design uses a light cream + dark green theme (primary: `#0F5132`, accent: `#FF7A00`). It has a left sidebar with Fraunces/Playfair Display headings and Poppins body. The sidebar has nav items, theme toggle, switch branch, logout. Cards use `.pos-card` and `.pos-card-hover` utility classes defined in `index.css`.

## Requested Changes (Diff)

### Add
- Full dark POS color system as the default theme (not light-first). The app should load in dark mode by default, and the theme toggle switches to a light version.
- New CSS utility classes: `.dark-card`, `.glow-btn`, `.glow-btn-orange`, `.sidebar-item-active`, `.sidebar-item` with orange glow effects.
- Orange glow box shadows for active sidebar items, hover states, and primary buttons.
- New keyframe `pulse-glow` for glowing button effect on CTAs.

### Modify
- **`index.css`** — completely replace `:root` and `.dark` token blocks. Dark mode (`#1E1E2E` background) becomes the `:root` default. Light mode becomes `.light` override class. Update all semantic tokens to match the new dark POS palette. Update `.pos-card`, `.pos-card-hover` with dark card background and orange hover glow.
- **`tailwind.config.js`** — update `boxShadow` to add `glow-orange`, `glow-active`, `card-dark` shadows. No font change (keep Poppins/body + display). Update `keyframes` to add `pulse-glow`, `slide-in`.
- **App.tsx — AppShell / Sidebar** — apply dark sidebar background (`#1A1A2A`), orange accent highlight for active item with left border orange glow, rounded icon containers with orange glow on active. Bottom section: Switch Branch, Dark Mode Toggle, Logout with proper dark styling.
- **App.tsx — All screen components** — apply the new dark design tokens throughout: dark card backgrounds, orange accent buttons, orange text for prices/amounts, secondary muted text in `#B8B8C5`.
- **App.tsx — BillingScreen** — category tabs with orange active state. Menu item cards with dark background and orange add button. Right panel with dark background. "Proceed to Payment" button with orange glow.
- **App.tsx — PaymentScreen** — dark background total card with orange gradient. Payment method buttons with orange glow on selection. Cash/QR panel with dark card style.
- **App.tsx — DashboardScreen** — stat cards with dark card bg and orange accent values. Module cards with dark card bg, image, and orange hover glow.
- **App.tsx — MenuScreen** — dark card items, orange price text, orange add/edit buttons.
- **App.tsx — EmployeesScreen** — dark employee cards, orange salary/advance accents.
- **App.tsx — ReportsScreen** — dark chart cards, orange chart colors.
- **App.tsx — SettingsScreen** — dark form cards, orange save buttons.
- **App.tsx — BillPreviewScreen** — dark preview background, print button with orange glow.
- **App.tsx — LoginScreen** — keep the existing green gradient background for contrast/brand. Update PIN card numpad buttons to use dark card style with orange highlights.
- **App.tsx — BranchSelectScreen** — keep dark green gradient background, update branch cards to use dark card style with orange hover glow.

### Remove
- All hardcoded light-theme hex values (`#F8F5F0`, `#0F5132` inline, `rgba(15,81,50,...)` inline) in screen components — replace with CSS token classes.
- Light card backgrounds on module screens when in default dark mode.

## Implementation Plan

1. Update `index.css`:
   - Set `:root` to the new dark POS palette (`#1E1E2E` background → oklch, `#2F3045` card → oklch, `#FF7A45` accent → oklch, `#FFFFFF` foreground, `#B8B8C5` muted, `#3A3A4F` border).
   - Move light theme values to a `.light` class (not `.dark`).
   - Update `.pos-card`, `.pos-card-hover` with dark card bg and orange glow on hover.
   - Add `.glow-btn`, `.glow-btn-orange` utilities with orange box-shadow glow.
   - Update sidebar-related tokens.
   - Update print styles (keep as-is).

2. Update `tailwind.config.js`:
   - Add `glow-orange`, `card-dark` box shadow tokens.
   - Add `pulse-glow` keyframe and animation.

3. Rewrite all screen components in `App.tsx` to use semantic token classes throughout:
   - Replace inline hex colors with `text-accent`, `text-muted-foreground`, `bg-card`, `bg-background`, `border-border`.
   - Apply `.glow-btn-orange` to all primary CTA buttons.
   - Apply dark card styling to all cards.
   - Update sidebar with orange active glow.
   - Default dark mode initialization: `isDark` state starts as `true`, `document.documentElement` gets `dark` class removed on light mode toggle.

4. Validate (typecheck + lint + build).
