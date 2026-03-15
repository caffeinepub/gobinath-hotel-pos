# Gobinath Hotel POS

## Current State
Full POS app exists with Owner PIN (1234), Staff PIN (0000), sidebar navigation, billing, menu, employees, reports, settings. Welcome screen and login screens already exist but need a redesign.

## Requested Changes (Diff)

### Add
- Nothing new

### Modify
- **Welcome Screen**: White background, centered card with "Welcome to Gobinath Hotel" title, "Restaurant Management System" subtitle, "Welcome" heading, "Select your login type" text, two buttons: Owner Login (light card, orange outline, shield icon) and Staff Login (dark button, user icon), "Powered by NextYU Solution" footer
- **Owner Login Screen**: White background, "Owner Login" heading only (no logo), 4-digit PIN dots, numeric keypad (1-9, 0), Clear, Delete, orange Login button. PIN = 8274. Invalid PIN message on wrong entry. Back button top-left returns to Welcome.
- **Staff Login Screen**: Same layout as Owner Login. PIN = 9020. Title "Staff Login". Back button returns to Welcome.

### Remove
- Logos from Owner and Staff login screens
- Any non-white/orange color accents on login screens

## Implementation Plan
1. Update WelcomeScreen component with new card layout, two buttons (Owner/Staff)
2. Update OwnerLoginScreen: remove logo, show only heading, update PIN to 8274, large keypad, back button
3. Update StaffLoginScreen: remove logo, show only heading, update PIN to 9020, large keypad, back button
4. Ensure white background and orange accent throughout all three screens
5. Touch-optimized large keypad buttons for tablet/mobile
