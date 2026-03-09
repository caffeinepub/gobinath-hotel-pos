# Gobinath Hotel POS

## Current State
The app has a full POS system with Login, Branch Select, Dashboard, Billing, Payment, Bill Preview, Menu Management, Reports, Employees, Money Management, and Settings screens. The login screen currently defaults to a User Login form (Username + Mobile + Password) with an "Owner Login" button that leads to a PIN-select screen showing Owner/Staff PIN options. The sidebar uses a dark navy theme by default with white/orange toggle for light mode. Green colors are present throughout the login card and various UI elements (button backgrounds #0F5132, focus rings, hover states, etc.).

## Requested Changes (Diff)

### Add
- First screen (App Open Screen): a clean selection screen showing two large cards: "Owner Login" and "Staff Login", displayed when the app opens before any login flow
- "Sign In" button under the User Login form for Staff Login
- Full White + Dark + Glowing Orange theme replacing all green colors
- Light Mode: white background, orange highlight, soft shadows
- Dark Mode: dark background (#1E1E2E), orange glowing buttons, white text
- Apply consistent orange-accent theme across ALL screens: Login, Dashboard, Billing, Payment, Reports, Employees, Settings

### Modify
- **Login Screen**: Redesign the first view as a selection screen with two large touch-friendly cards: "Owner Login" (→ PIN keypad) and "Staff Login" (→ Username + Mobile + Password form). Add "Sign In" button under the staff login form.
- **Owner Login flow**: Clicking "Owner Login" card → goes directly to Owner PIN keypad screen (4-digit PIN, keypad 1-9/C/0/⌫ layout)
- **Staff Login flow**: Clicking "Staff Login" card → shows Username + Mobile Number + Password form with "Sign In" button
- **Remove ALL green colors** from login screen: replace #0F5132 with orange (#FF7A00 / #F97316) or dark (#1E1E2E) depending on context
- Login card background gradient: replace dark green gradient with dark (#0B1120 or #1E1E2E) or white depending on mode
- Submit button on login: orange glow button instead of green
- index.css: update light mode sidebar and all green-derived colors to use orange palette only
- Login PIN dots and active states: use orange instead of green
- All "focus:border-green-700", "focus:ring-green-700" → replace with orange equivalents
- Dashboard, Billing, Payment, Reports, Employees, Settings: ensure no green accent colors remain; use orange (#FF7A45 / #F97316) consistently
- The existing dark mode is already orange-based and mostly correct; light mode needs green→orange conversion

### Remove
- All instances of green color usage in login UI (#0F5132, green-700, green-800 etc.)
- The current default "User Login" form as the first screen — replace with Owner/Staff selection cards
- Green border/background on Owner Login card in pin-select view
- Green background on submit buttons in login forms

## Implementation Plan
1. Update `index.css` light mode theme: replace green-derived sidebar and accent tones with orange variants; ensure no green OKLCH values remain in light mode
2. Redesign `LoginScreen` in App.tsx:
   - Default view (`loginView === "select"`): two large cards — "Owner Login" and "Staff Login"
   - Owner Login card click → `loginView = "pin-entry"` with owner type
   - Staff Login card click → `loginView = "user"` (Username + Mobile + Password form)
   - Staff login form: rename submit button to "Sign In"
   - Remove "Owner Login" button from bottom of user form (it's now the first screen)
   - Remove pin-select intermediate step (Owner Login goes straight to PIN)
   - Replace all green colors in login with orange/dark
3. Update login card background: use dark gradient (#0B1120 → #1a1a2e) for dark default, and white/light for light mode
4. Replace all green focus/border/hover states in login inputs with orange equivalents
5. Audit Dashboard, Billing, Payment screens for any remaining green hardcoded colors and replace with orange
6. Ensure light mode (`light` class) applies proper orange-accent theme everywhere with no green residue
