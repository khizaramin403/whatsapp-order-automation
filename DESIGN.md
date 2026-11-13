# DESIGN.md: Dashboard design rules

Source: `docs/PROJECT_PLAN_v1.1.pdf`, Section 7 (pages 7 to 14). Images: `docs/design/`.
These values are fixed. Do not change colors, fonts, sizes or add decoration. If a library version needs different syntax, keep the values and change only the syntax, and tell me.

## Principles
- Calm and premium: dark midnight base, soft white surfaces, gold used sparingly.
- Minimal: thin borders, light shadows, generous spacing. No gradients, glows, neon, glassmorphism or decorative blobs.
- Classic: a serif only for the brand name and the login heading.
- Operational first: large tap targets, clear status colors, readable on a phone.
- One accent: gold means "important or active". At most ONE gold button per screen.

## Colors
| Name | Hex | Use |
|---|---|---|
| Midnight Blue | #10202D | Sidebar, primary buttons, headings, main text |
| Muted Gold | #C7A667 | Accent: active marker, key button, badge on dark, focus on dark |
| Soft White | #F7F7F7 | Page background, text on dark |
| White | #FFFFFF | Cards, topbar, tables, inputs |
| Midnight 800 | #1B2D3B | Sidebar hover and active background |
| Midnight 700 | #22394B | Sidebar borders, avatar fallback on dark |
| Midnight Deep | #0B1620 | Tooltips |
| Slate Text | #4A5865 | Secondary text |
| Muted Text | #5F6C79 | Labels, captions, placeholders |
| Sidebar Text | #A9B4BE | Inactive sidebar labels and icons |
| Border | #E2E5E9 | Card and table borders |
| Input Border | #D5DAE0 | Inputs and secondary buttons |
| Hover Fill | #F2F4F6 | Row, menu and ghost button hover on light |
| Gold Tint | #F4ECDC | Selected row, soft highlight, avatar fallback on light |
| Gold Text | #7D6228 | Links and gold-colored text on light backgrounds |
| Gold Hover | #B5964F | Gold button hover |
| Gold Pressed | #A3853F | Gold button pressed |

Proportion: about 60% soft white and white, 30% midnight, 10% gold.

Gold is allowed for: active sidebar marker (3px bar) and active icon, one accent button per screen (for example "Accept order"), new-order badge on the dark sidebar, focus ring on dark surfaces, chart highlight, selected-row tint.
Gold is NEVER body text on light backgrounds (contrast too low). Use Gold Text #7D6228 or midnight.

### Status colors (muted, separate from brand)
| Meaning | Fill | Text | Used for |
|---|---|---|---|
| Success | #E6F2EC | #1F5C42 | Ready, payment verified (solid #2F7D5B for dots and icons) |
| Warning | #FBF0DA | #7A4E0B | Pending, payment awaiting check |
| Danger | #F8E4E1 | #8E2A22 | Rejected, cancelled, errors (solid #B3392F, hover #9C2F26) |
| Info | #E3EDF5 | #1F4C73 | Preparing, informational notes |
| Gold | #F4ECDC | #7D6228 | Accepted |
| Midnight tint | #E3E8EE | #10202D | Out for delivery |
| Neutral | #ECEEF1 | #3A4651 | Delivered (history), COD tag, inactive |
Every status shows a text label plus color, never color alone.

## Design tokens (shadcn CSS variables)
```css
:root {
  --background: #F7F7F7;      --foreground: #10202D;
  --card: #FFFFFF;            --card-foreground: #10202D;
  --popover: #FFFFFF;         --popover-foreground: #10202D;
  --primary: #10202D;         --primary-foreground: #F7F7F7;
  --secondary: #ECEEF1;       --secondary-foreground: #10202D;
  --muted: #ECEEF1;           --muted-foreground: #5F6C79;
  --accent: #F2F4F6;          --accent-foreground: #10202D;
  --destructive: #B3392F;     --border: #E2E5E9;
  --input: #D5DAE0;           --ring: #10202D;
  --gold: #C7A667;            --gold-foreground: #10202D;
  --gold-hover: #B5964F;      --gold-tint: #F4ECDC;   --gold-text: #7D6228;
  --success: #2F7D5B;  --warning: #B7791F;  --info: #2F6690;
  --sidebar: #10202D;         --sidebar-foreground: #A9B4BE;
  --sidebar-accent: #1B2D3B;  --sidebar-accent-foreground: #F7F7F7;
  --sidebar-primary: #C7A667; --sidebar-border: #22394B;  --sidebar-ring: #C7A667;
  --sidebar-width: 16.5rem;   --sidebar-width-icon: 4.5rem;
  --radius: 0.5rem;
}
```

## Typography
- UI and body (English and Roman Urdu): Inter, weights 400, 500, 600.
- Arabic: IBM Plex Sans Arabic, weights 400, 500, 600, whenever the language is Arabic.
- Brand wordmark and login heading ONLY: Playfair Display 600. Never in tables or forms.
- Numbers (prices, order numbers, totals): Inter with tabular numerals.
- Load with `next/font` (self-hosted). Switch font by `html[lang]`. Arabic UI uses Western digits (0-9).

| Style | Size / line height | Weight | Color |
|---|---|---|---|
| Page title | 24 / 32 | 600 | #10202D |
| Section title | 18 / 28 | 600 | #10202D |
| Card title | 16 / 24 | 600 | #10202D |
| Body and table text | 14 / 20 | 400 | #10202D (primary), #4A5865 (secondary) |
| Form label | 13 / 18 | 500 | #10202D |
| Caption and helper | 12 / 16 | 400 | #5F6C79 |
| Table header | 12 / 16, uppercase, letter-spacing 0.04em | 600 | #5F6C79 |
| KPI number | 28 / 36 | 600 | #10202D |
| Login heading (Playfair) | 34 / 40 | 600 | #10202D |
| Arabic text | add 1px to size, line height 1.7 | 400 to 600 | same |

Text colors by background:
- Soft white / white: heading #10202D, body #10202D, secondary #4A5865 or #5F6C79, link #7D6228 (hover #5F4A1C, underlined).
- Midnight (sidebar): heading and body #F7F7F7, secondary #A9B4BE, link #C7A667 (hover #E8D9B5).

## Spacing, radius, shadow, motion
- Spacing scale (4px base): 4, 8, 12, 16, 24, 32, 48. Page padding 32px desktop, 16px mobile. Card padding 20px.
- Radius: inputs and buttons 8px, cards 12px, drawers and dialogs 12px, badges fully rounded, avatars circular.
- Shadow: card `0 1px 2px rgba(16,32,45,0.06)`. Popover, drawer, toast `0 8px 24px rgba(16,32,45,0.12)`. No colored shadows.
- Borders: 1px #E2E5E9. Prefer borders over heavy shadows.
- Motion: 150 to 200ms ease-out for hover, sidebar width and drawers. No bounce. Turn animations off for `prefers-reduced-motion`.
- Tap targets: minimum 40px height (44px on mobile).

## App layout
Dark sidebar on the left (right in Arabic), white topbar, soft white content area. Use shadcn Sidebar with `collapsible="icon"`.

### Sidebar
- Widths: expanded 264px, collapsed 72px, transition 200ms ease-out. Content area resizes with it.
- Toggle: icon button at the very top of the sidebar in the header row (lucide PanelLeftClose when expanded, PanelLeftOpen when collapsed). Expanded: brand mark and wordmark on one side, toggle on the other. Collapsed: only the toggle, centered. Shortcut Ctrl/Cmd+B. State saved per user (Zustand persist).
- Header height 64px (same as topbar).
- Groups: Operations (Orders, Kitchen, Delivery), Catalog (Menu), Insights (Analytics), Manage (Team, Settings). Group labels 10.5px uppercase #7F8C98; when collapsed they become thin dividers. Items hidden by role (a chef only sees Kitchen).
- Item: 40px tall, 8px radius, icon 20px (stroke 1.75), 12px gap, label 14px.
- Default: icon and label #A9B4BE.
- Hover: background #1B2D3B, label and icon #F7F7F7.
- Active: background #1B2D3B, label #F7F7F7 semibold, icon #C7A667, 3px gold bar on the inline-start edge.
- Keyboard focus: 2px gold ring #C7A667, 2px offset.
- Badge: new-order count as a gold pill with midnight text. Collapsed: small gold dot on the icon.
- Tooltips (collapsed only): background #0B1620, text #F7F7F7, 13px, 6px radius, 150ms delay.
- Footer: separator #22394B, avatar, name (14px semibold), role (12px #A9B4BE), chevron opening the user menu (profile, language, sign out). Collapsed: avatar only.
- Mobile (under 768px): off-canvas sheet opened from a menu button in the topbar.
- Arabic (RTL): sidebar on the right, gold bar on the right edge, toggle icons mirror.

### Topbar
- 64px, white, 1px bottom border #E2E5E9.
- Inline-start: menu button (mobile only), page title (24px semibold).
- Inline-end in order: Live dot with the word "Live" (green when SSE connected, amber when reconnecting), sound toggle, notification bell, language switcher (EN, Roman Urdu, AR), avatar with user menu.
- Mobile: only title, live dot, bell and avatar.

## Buttons
Height 40px (44px mobile), padding 16px horizontal, radius 8px, font 14px weight 600. Small variant 32px. Hover transition 150ms, no scale or lift.
| Variant | Default | Hover | Pressed | Disabled |
|---|---|---|---|---|
| Primary | #10202D, text #F7F7F7 | #1B3345 | #0B1620 | #AEB7C0 |
| Accent (gold) | #C7A667, text #10202D | #B5964F | #A3853F | #E6D9BB, text #7D6228 |
| Secondary | white, border #D5DAE0, text #10202D | #F2F4F6 | #E2E5E9 | white, text #AEB7C0 |
| Ghost / icon | transparent | #ECEEF1 | #E2E5E9 | text #AEB7C0 |
| Destructive | #B3392F, text white | #9C2F26 | #852720 | #E3B8B3 |
Focus ring: 2px #10202D with 2px offset on light surfaces, 2px #C7A667 on dark surfaces.
Loading: label stays, small spinner before it, button disabled (example "Signing in...").

## Form controls
- Input and Select (40px): white fill, 1px #D5DAE0, text #10202D, placeholder #66737F. Hover border #AEB7C0. Focus border #10202D plus 3px ring rgba(199,166,103,0.35). Error border #B3392F with message 12px #8E2A22 below. Disabled fill #F2F4F6, text #AEB7C0.
- Label: 13px 500 #10202D above the field. Required marker is a small Gold Text asterisk.
- Checkbox and Switch: border #AEB7C0 on white; hover border #10202D; checked navy fill with white check; switch on = navy track.
- Dropdown and select list: white, border, radius 8, shadow. Item hover #F2F4F6. Selected item gold-tint fill with a check icon.

## Tables, cards, badges, tabs, drawer
- Table: white rows, 1px #E2E5E9 dividers, header row #F7F7F7 with 12px uppercase #5F6C79 text, row height 52px, row hover #F2F4F6, selected row Gold Tint with 3px gold bar on inline-start, sticky header, pagination 20 rows per page.
- Card: white, 1px #E2E5E9, radius 12px, padding 20px, light shadow. Clickable cards (order cards): 1px gold border and slightly stronger shadow on hover.
- Badge: fully rounded, 22px tall, 12px semibold, status color pairs above.
- Tabs: inactive #5F6C79, hover #10202D, active #10202D with 2px gold underline.
- Drawer (Sheet): order details in a side sheet 480px wide (bottom sheet on mobile), with title, status badge, timeline and sticky action buttons.

## Loading, empty and feedback states
- Page or list loading: shadcn Skeleton, shapes match the final layout, base #ECEEF1 with soft shimmer #F7F7F7 every 1.4s (off for reduced motion).
- Button in progress: shadcn Spinner, 16px, inside the button, uses the button text color. Never full-screen blocking.
- Short result (saved, accepted, failed): Sonner toast, bottom end (bottom left in Arabic), white card, status icon, 4 second auto-dismiss, errors stay longer.
- Persistent problem (connection lost, token expired): shadcn Alert with tinted status fill, 1px border, icon, title, one line, optional "Retry".
- Page fails to load: Next.js error.tsx plus Alert and a Retry button.
- No data: empty state with a line icon, title, one sentence and one button.
- New order arrives: toast, sound (muted by the sound toggle), sidebar badge, card appears at the top of New.
- Reconnecting: topbar Live dot amber with "Reconnecting".

## Icons
lucide-react, outline only, stroke 1.75. 20px in navigation and buttons, 16px inline with text, 24px in empty states. Icons inherit text color; active sidebar icon is gold; status icons use the status color. Suggested set (verify exact names when installing): Orders ClipboardList, Kitchen ChefHat, Delivery Bike, Menu UtensilsCrossed, Analytics ChartColumn, Team Users, Settings Settings, Notifications Bell, Sound Volume2 and VolumeOff, Language Languages, Sidebar toggle PanelLeftClose and PanelLeftOpen, Sign out LogOut, Password Eye and EyeOff, Phone Phone, Address MapPin, Time Clock, COD Banknote, Online payment Smartphone, Screenshot Image, Success CircleCheck, Warning TriangleAlert, Error CircleAlert, Info Info. In Arabic, directional icons flip with the `rtl:` variant.

## Avatars
- Circle. Sizes 24px (tables, timeline), 32px (topbar), 40px (team list, user menu), 64px (profile). Hotel logo is a rounded square (8px radius).
- Photo: square crop, 1px #E2E5E9 border.
- Fallback: two initials, semibold. Light surfaces: fill #F4ECDC, text #7D6228. Dark sidebar: fill #22394B, text #E8D9B5, border #3A5266. Same colors for everyone.
- Use shadcn Avatar (AvatarImage, AvatarFallback). Role is shown as small text or a neutral badge, never by avatar color.

## Login screen (Figure 4, docs/design/design-page-14.png)
- Desktop: two panels, brand panel midnight (50%) and form panel soft white (50%). Mobile: only the form with the brand mark above.
- Brand panel: wordmark top-left (Playfair), large two-line serif statement, 64px gold rule, one muted supporting line, a faint concentric-circle line pattern (about 6% contrast). No photos, no gradients.
- Form card: max width 400px, centered. Brand mark (40px rounded square), heading "Welcome back" (Playfair 34), helper text #5F6C79, Email field, Password field with show/hide eye icon, Remember me checkbox, "Forgot password?" link in Gold Text #7D6228, full-width Primary "Sign in" button (46px).
- Language switcher pill (EN, Roman Urdu, AR) in the top corner of the form panel. Arabic flips to RTL immediately.
- Loading: spinner and "Signing in...", fields disabled.
- Errors: failed login shows an Alert "Invalid email or password" (never say which one). Too many attempts shows a warning Alert with the wait time. Field errors under the field.
- Accessibility: autofocus on email, Enter submits, visible focus rings, labels connected to inputs, password-manager friendly.
- After login: owner and manager go to Orders, chef to Kitchen, rider to Delivery.

## Charts (shadcn Chart, Recharts)
- Bar: orders per hour or day. Bars #10202D, peak bar gold #C7A667.
- Line or area: sales over time. Line midnight, area fill #F4ECDC.
- Donut: COD vs online. Midnight and gold, percentage in the center, direct labels (no legend hunting).
- Extra series colors if needed: slate blue #4F6D85, sage #6F9C8A, taupe #9A8F7A.
- Gridlines #E2E5E9, axis text 12px #5F6C79, tooltip is a white card with a light shadow. No 3D, no gradients, no animation longer than 300ms. Test RTL axes in Arabic.

## RTL and languages
- Languages: English (en), Arabic (ar, RTL), Roman Urdu (ur-Latn). No Urdu script.
- Use Tailwind logical classes (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`, `text-start`), never left/right for layout. After generating each shadcn component, convert left/right classes.
- Do not use fixed-width buttons; allow wrapping; test every screen in all three languages.

## Do / Do not (avoid an "AI-generated" look)
| Do | Do not |
|---|---|
| Midnight, gold and soft white only, plus muted status colors | Purple or blue-to-pink gradients, neon glows |
| Thin 1px borders and light shadows | Heavy shadows, glassmorphism, floating blobs |
| Real content and real numbers in cards | Decorative illustrations and sparkle icons |
| Serif only for the brand and login heading | Mixing many fonts or very large rounded headings |
| One gold accent per screen | Gold everywhere |
| Short plain labels ("Accept", "Mark ready") | Marketing-style text inside the app |

## Contrast check
Contrast ratios in the plan were calculated by hand. During Phase 1 check every text and background pair with the browser DevTools contrast checker (target 4.5:1 for text, 3:1 for icons and focus rings) and report any failure instead of changing colors silently.
