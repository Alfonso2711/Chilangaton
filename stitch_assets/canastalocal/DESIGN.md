---
name: CanastaLocal
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#3d4a42'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#6d7a72'
  outline-variant: '#bccac0'
  surface-tint: '#006c4a'
  primary: '#006948'
  on-primary: '#ffffff'
  primary-container: '#00855d'
  on-primary-container: '#f5fff7'
  inverse-primary: '#68dba9'
  secondary: '#9d4300'
  on-secondary: '#ffffff'
  secondary-container: '#fd761a'
  on-secondary-container: '#5c2400'
  tertiary: '#9b3e3b'
  on-tertiary: '#ffffff'
  tertiary-container: '#ba5551'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#85f8c4'
  primary-fixed-dim: '#68dba9'
  on-primary-fixed: '#002114'
  on-primary-fixed-variant: '#005137'
  secondary-fixed: '#ffdbca'
  secondary-fixed-dim: '#ffb690'
  on-secondary-fixed: '#341100'
  on-secondary-fixed-variant: '#783200'
  tertiary-fixed: '#ffdad7'
  tertiary-fixed-dim: '#ffb3ae'
  on-tertiary-fixed: '#410004'
  on-tertiary-fixed-variant: '#7f2928'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  display:
    fontFamily: Plus Jakarta Sans
    fontSize: 3.5rem
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.03em
  display-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 2.25rem
    fontWeight: '800'
    lineHeight: '1.15'
    letterSpacing: -0.025em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 2.25rem
    fontWeight: '800'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 1.75rem
    fontWeight: '800'
    lineHeight: '1.25'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 1.5rem
    fontWeight: '700'
    lineHeight: '1.3'
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 1.25rem
    fontWeight: '700'
    lineHeight: '1.35'
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 1.125rem
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: -0.01em
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 0.9375rem
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: 0em
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 0.8125rem
    fontWeight: '400'
    lineHeight: '1.45'
    letterSpacing: 0em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 0.875rem
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 0.75rem
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system establishes a high-utility, hyper-efficient neighborhood grocery ecosystem—elevating traditional public markets into a polished, friction-free digital commerce experience. The aesthetic balances the stripped-back, technical precision of modern SaaS (clean monochrome lines, tactile affordances, strict typography) with the organic vitality of fresh produce.

### Design Principles
- **Utilitarian Elegance:** Prioritize product visibility, rapid replenishment workflows, and checkout speed above all decorative artifacts.
- **Air & Structure:** Leverage deliberate whitespace (p-6, p-8 cadence) to make dense market catalogs feel breathable, premium, and easily scannable.
- **Zero Ambiguity:** Use hyper-tactile borders, crisp cards, and purposeful color cues to immediately communicate interactive states, stock availability, and neighborhood fulfillment status.

## Colors

The palette rejects standard corporate blues in favor of an organic, hyper-fresh market profile anchored by a crisp, high-contrast monochrome foundation.

### Palette Architecture
- **Primary (`#059669` / Emerald-600):** Represents freshness, field harvest, verification, and primary purchase intent. Reserved strictly for primary action buttons, active navigation markers, and positive fulfillment flows.
- **Secondary Accent (`#f97316` / Orange-500):** Evoking warm mamey fruit, ripening seasons, and market energy. Deployed sparingly for deals, urgency triggers, dynamic badges, and checkout incentives.
- **Canvas Base:** The overall application operates on an ultra-light neutral backdrop (`slate-50` / `#f8fafc`), setting off foreground content panels in pure white (`#ffffff`).
- **Typography & Structure (`slate-900` to `slate-400`):** Headers command attention in ink-black slate (`#0f172a`), subtitles and secondary metadata sit at mid-slate (`#64748b`), and structural dividers sit at faint hairline boundaries (`#e2e8f0` / `#f1f5f9`).

## Typography

The typography couples geometric legibility with assertive editorial weight. Using `Plus Jakarta Sans` throughout the platform produces a unified, contemporary personality reminiscent of best-in-class modern web tools.

- **Headlines:** Set in `font-bold` and `font-extrabold` (weights 700 and 800) with slight negative tracking (`letterSpacing: -0.02em` to `-0.03em`). This delivers visual punch across storefront promotions, category markers, and vendor profiles.
- **Body:** Built for rapid scanning of prices, weights, and product origins. Default neutral body text rests at weight 400 with comfortable line heights to prevent visual crowding in dense order manifests.
- **Captions & Metadata:** Rendered in `text-slate-500` at weight 500 or 600 (`label-sm`), ensuring unit prices (e.g., "$45/kg") and stall identifiers remain distinct without competing with primary product titles.

## Layout & Spacing

Layouts follow an intentional container grid designed to manage varying catalogue densities without feeling cluttered.

### Rhythmic Structure
- **Outer Canvas Cadence:** Large content sections adopt an alternating `p-6` (1.5rem) and `p-8` (2rem) interior rhythm. Content never bleeds to raw viewport edges on mobile; it maintains a mandatory 1rem boundary.
- **Desktop Grid:** A standard 12-column responsive layout with max-width containment of `1280px` (`max-w-7xl`). Product cards scale seamlessly in 4-column (desktop), 3-column (small desktop), 2-column (tablet), and 1-to-2 column auto-flow (mobile).
- **Mobile Density:** Mobile grocery workflows must allow single-thumb browsing. Sticky horizontal category chips and bottom purchase bars utilize compact padding (`space-sm` to `space-md`) to maximize vertical listing area.

## Elevation & Depth

Visual hierarchy uses physical sheet layering: crisp, high-value surfaces set against an ultra-soft canvas, elevated by subtle hairline edges rather than heavy, muddy drop shadows.

### Elevation Hierarchy
- **Canvas (Ground Level):** `bg-slate-50` / `#f8fafc`. All global scrolling and multi-merchant catalogs happen on this non-glare, calm substrate.
- **Cards & Primary Surfaces (Level 1):** Pure `bg-white` equipped with a hairline border (`border border-slate-100` or `border-slate-200/80`) paired with an ambient shadow (`box-shadow: 0 1px 2px 0 rgb(15 23 42 / 0.04)`).
- **Interactive Hover & Dropdowns (Level 2):** Elevated interactive elements shift border emphasis (`border-slate-300`) and cast a refined floating shadow (`box-shadow: 0 4px 12px -2px rgb(15 23 42 / 0.08)`).
- **Modals, Drawer Sheets, & Fixed Cart Dock (Level 3):** Grounded using deep backdrop blur filters (`backdrop-blur-md bg-white/90`) bounded by structural hairline frames, ensuring foreground content remains hyper-legible over complex product imagery.

## Shapes

The geometric signature uses smooth, modern curvature inspired by premium hardware and consumer platforms.

- **Hero Units & Major Panels:** Curved using `rounded-3xl` (1.5rem / 24px) to create welcoming visual anchors for neighborhood announcements and featured local stands.
- **Cards & Modules:** Enclosed within `rounded-2xl` (1rem / 16px) for a soft, tactile, organized grid.
- **Controls & Form Elements:** Buttons, text input fields, search consoles, and quantity adjusters adhere consistently to `rounded-xl` (0.75rem / 12px).
- **Status Tags & Filters:** Pills leverage full continuous curvature (`rounded-full`) to differentiate metadata tags from clickable rectilinear containers.

## Components

Components follow Shadcn/ui patterns adapted for rapid, frictionless neighborhood retail.

### Buttons
- **Primary CTA:** Background `bg-emerald-600`, text `text-white`, `font-semibold`, shape `rounded-xl`, with subtle hover transition (`hover:bg-emerald-700 active:scale-[0.98]`).
- **Secondary Accent CTA:** Background `bg-orange-500`, text `text-white`, reserved for flash deals, dynamic checkout additions, or vendor tips.
- **Outline Buttons:** `border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 hover:border-slate-300 rounded-xl`. Zero loud color styling on utility buttons.

### Inputs & Search Bars
- Pure white background (`bg-white`) bordered with `border-slate-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10`.
- Integrated left-hand search icon (`text-slate-400 size-4`) with an optional trailing keyboard shortcut indicator or clear button.
- Generous internal vertical clearance (`h-11 px-3.5 rounded-xl`).

### Cards & Grid Containers
- Built on `bg-white border border-slate-150 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow`.
- Product cards house an edge-to-edge asset area with smooth rounded internal corners (`rounded-xl`), an item badge (e.g., "Puesto #12"), title in `font-extrabold text-slate-900`, price in bold emerald, and an inline rapid-add `+` button.

### Badges & Filter Chips
- **Status/Origin Pills:** `rounded-full px-2.5 py-0.5 text-xs font-semibold`.
  - Organic/Fresh: `bg-emerald-50 text-emerald-700 border border-emerald-150`.
  - Market Offer/Urgent: `bg-orange-50 text-orange-700 border border-orange-150`.
  - Neutral Stall Metadata: `bg-slate-100 text-slate-600`.
- **Category Filter Rail:** Scrollable, horizontal pill row. Inactive items use `bg-white border border-slate-200 text-slate-600 hover:border-slate-300`; active items switch to `bg-slate-900 text-white border-transparent`.

### Segmented Tabs
- Pill-in-trough design using `bg-slate-100 p-1 rounded-xl`. 
- Active tab floats with a crisp white card layer (`bg-white shadow-xs text-slate-900 font-semibold rounded-lg transition-all`).

### Checkboxes & Radios
- Square rounded inputs (`rounded-md border-slate-300 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600`).