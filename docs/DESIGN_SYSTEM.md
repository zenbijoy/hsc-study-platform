# HSC Study Platform — Production Design System Specification

**Version**: 3.0 (Production Design Tokens & Component Standard)  
**Applies To**: `apps/mobile` & Future Client Frontends  

---

## 1. Design Philosophy

The HSC Study Platform design language balances **Modern Academic Polish**, **Energetic Bengali Typography**, and **60 FPS Performance**:
- **Content First**: Every card communicates useful information (page ranges, formulas, board marks), avoiding empty decorative boxes.
- **Controlled Palette**: Standardized semantic tokens prevent random per-screen hexadecimal styling.
- **Native Performance**: Cards inside FlashLists avoid heavy blur or expensive Skia scene allocations.
- **Dual Mode**: High-contrast AMOLED Dark by default, with an academic Crisp Light mode.

---

## 2. Color System & Semantic Tokens

### Raw & Brand Accents
- `Mint Primary`: `#57E0B7` (Action, Success & Formula Accent)
- `Sky Secondary`: `#6CB7FF` (Info, Physics & CQ Accent)
- `Violet Accent`: `#A58BFF` (Higher Math & MCQ Accent)
- `Coral Accent`: `#FF8A76` (Biology Accent)
- `Amber Accent`: `#FBBF24` (Streaks & Star Ratings)
- `Rose Accent`: `#F43F5E` (Danger & Favorites)

### Controlled Subject Themes (`src/theme/subjects.ts`)
| Subject Key | English Name | Bangla Name | Primary Accent | Gradient Preset | Tint Background |
|---|---|---|---|---|---|
| `physics` | Physics | পদার্থবিজ্ঞান | `#6CB7FF` | `['#17385E', '#10243C', '#071018']` | `rgba(108,183,255,0.12)` |
| `chemistry` | Chemistry | রসায়ন | `#57E0B7` | `['#124438', '#0C2A23', '#071018']` | `rgba(87,224,183,0.12)` |
| `mathematics` | Higher Math | উচ্চতর গণিত | `#A58BFF` | `['#2E1E5E', '#1D133D', '#071018']` | `rgba(165,139,255,0.12)` |
| `biology` | Biology | জীববিজ্ঞান | `#FF8A76` | `['#4E211A', '#321510', '#071018']` | `rgba(255,138,118,0.12)` |
| `ict` | ICT | আইসিটি | `#38BDF8` | `['#153A52', '#0E2333', '#071018']` | `rgba(56,189,248,0.12)` |

---

## 3. Typography Scale (`src/theme/typography.ts`)

| Variant | Size | Line Height | Weight | Usage |
|---|---|---|---|---|
| `display` | 32px | 38px | 800 (ExtraBold) | Hero dashboard greetings & big milestones |
| `headlineLarge` | 24px | 30px | 700 (Bold) | Screen titles |
| `headlineMedium` | 20px | 26px | 700 (Bold) | Modal headers & formula equations |
| `titleLarge` | 18px | 24px | 600 (SemiBold) | Section headers |
| `titleMedium` | 16px | 22px | 600 (SemiBold) | Card titles & book names |
| `bodyLarge` | 15px | 22px | 400 (Regular) | Long reading text & question stems |
| `bodyMedium` | 14px | 20px | 400 (Regular) | Standard body text |
| `bodySmall` | 12px | 16px | 400 (Regular) | Sub-captions & stimulus excerpts |
| `labelLarge` | 14px | 18px | 700 (Bold) | Button labels |
| `labelMedium` | 12px | 16px | 700 (Bold) | Chips & small badges |
| `caption` | 11px | 14px | 400 (Regular) | Metadata, page bounds & timestamps |

---

## 4. Spacing, Radii & Shadows

- **Spacing**: `xs` (4px), `sm` (6px), `md` (8px), `base` (12px), `lg` (16px), `xl` (20px), `xxl` (24px), `3xl` (32px).
- **Layout Gutters**: Standard horizontal screen padding is `16px` (`spacing.screenHorizontal`).
- **Radii Hierarchy**: Buttons & Skeletons (`12px` / `16px`), Cards (`20px`), Floating Modals (`28px`), Pills & Badges (`full`).

---

## 5. Motion & Accessibility

- **Standard Press Scale**: `0.985` (subtle spring response).
- **Reduced Motion**: Automatically respected via `useReducedMotionPreference()`.
- **Touch Target Standard**: Minimum `44×44 pt` touch hitbox on all interactive buttons.
