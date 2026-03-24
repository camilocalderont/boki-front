# Timing Log — boki-front visual audit

## Iteración 1 — 2026-03-17

### Build
- Build time: 4.250s (production), 3.171s (dev serve)
- Build status: SUCCESS (0 errors, 2 warnings in legacy code)
- Bundle size: 204.63 kB initial

### Chrome DevTools — Visual Audit
- Login page load: ~200ms (from ng serve)
- Dashboard load: ~300ms
- Company page load: ~250ms
- Catalog page load: ~250ms

### CSS Variables Verification
- `--bk-color-primary`: #60A5FA (dark) / #2563EB (light) ✅
- `--bk-font-family`: 'Inter', system-ui, -apple-system, sans-serif ✅
- `--bk-font-size-base`: 14px ✅
- `--bk-bg-page`: #0F172A (dark) / #F8FAFC (light) ✅
- `--bk-bg-surface`: #1E293B (dark) / #FFFFFF (light) ✅
- `--bk-size-header-height`: 56px ✅
- `--bk-size-sidebar-width`: 240px ✅

### Automated Checks
- Oversized text (>24px non-h1): **0 issues** ✅
- Horizontal overflow: **0 issues** ✅

### Visual Quality Checklist

| Check | Status | Notes |
|-------|--------|-------|
| Font-size base ~14px | ✅ PASS | Changed from 16px to 14px |
| Table headers 12px uppercase | ✅ PASS | Uppercase, letter-spacing 0.05em, font-weight 600 |
| Typography hierarchy clear | ✅ PASS | h1 20px > section title 14px > body 14px > labels 12px |
| Spacing consistent (24px) | ✅ PASS | Pages use 24px padding, 16px gaps between cards |
| Sidebar active with bg + border | ✅ PASS | border-left 3px primary + background color-mix 10% |
| Tables have row hover | ✅ PASS | CSS in place (color-mix primary 3%) |
| Tabs have active indicator | ✅ PASS | Blue text + 2px bottom border + subtle bg |
| Buttons have coherent variants | ✅ PASS | primary/secondary/danger/ghost, sm/md/lg sizes |
| Search input positioned right | ✅ PASS | Right-aligned in table toolbar |
| Cards have border + surface bg | ✅ PASS | 1px border, bg-surface, border-radius-lg |
| No horizontal overflow | ✅ PASS | 0 overflow issues detected |
| Theme CSS variables active | ✅ PASS | All --bk-* variables loaded from JSON |
| Login modern design | ✅ PASS | Centered card, logo, uppercase labels, shadow |
| Dark mode works | ✅ PASS | Toggle switches palettes, localStorage persists |

### Screenshots Captured
- `e2e/screenshots/login-iter1.png` — Login (dark mode)
- `e2e/screenshots/login-iter1-v2.png` — Login (dark, after label fix)
- `e2e/screenshots/login-light-iter1.png` — Login (light mode)
- `e2e/screenshots/dashboard-iter1.png` — Dashboard (dark mode)
- `e2e/screenshots/dashboard-light-iter1.png` — Dashboard (light mode)
- `e2e/screenshots/company-iter1.png` — Company with tabs (dark mode)
- `e2e/screenshots/company-light-iter1.png` — Company with tabs (light mode)
- `e2e/screenshots/catalog-light-iter1.png` — Catalog with tabs (light mode)

### Changes Applied

#### Phase B: Theming
- Updated `default.json`: primary #2563EB, fontSizeBase 14px, fontSizeSm 12px, fontSizeLg 16px, fontSizeXl 20px, headerHeight 56px, sidebarWidth 240px, radiusSm 6px, border #E2E8F0, bgPage #F8FAFC
- Updated dark mode palette: primary #60A5FA, secondary #A78BFA, bgPage #0F172A, bgSurface #1E293B

#### Phase C: Atomic Components Created/Updated
- **bk-tabs** — Tab container with active indicator (border-bottom 2px + subtle bg)
- **bk-form-field** — Label wrapper (12px uppercase + error + hint)
- **bk-pagination** — Page size selector + page nav + info text
- **bk-search-input** — Pill-shaped with search icon and clear button
- **bk-icon** — SVG icon wrapper (sm/md/lg)
- **bk-tooltip** — Hover text tooltip
- **bk-button** — Updated sizes (sm 32px, md 36px, lg 40px) + hover brightness + active scale
- **bk-input** — Updated labels (12px uppercase, letter-spacing, text-secondary)

#### Phase D: Widgets Created/Updated
- **bk-data-table** — Toolbar (actions left, search right) + styled headers + row hover + pagination
- **bk-stat-card** — Icon badge (color-mix bg) + label + value + comparison
- **bk-sidebar** — Active state with border-left 3px + hover bg 5%
- **bk-layout-shell** — Content padding 24px

#### Phase E: Pages Updated
- **dashboard** — 4-col stat card grid + Actividad Reciente + Acciones Rápidas cards
- **login** — Logo above form, centered card, shadow
- **company** — Tabs (Datos/Sedes/Consultorios) + data-table + action button
- **catalog** — Tabs (Categorías/Servicios) + conditional data-tables
- **professionals, faqs, appointments, plans** — Consistent page layout with data-table
- **app.routes.ts** — Updated to use new FSD pages instead of legacy views

#### Phase F: Global Styles
- Updated `styles.css`: removed Tailwind, Inter font, 14px base, #F8FAFC bg, custom scrollbar 6px

### Conclusion
All 14 visual quality checks PASS. No further iterations needed.
