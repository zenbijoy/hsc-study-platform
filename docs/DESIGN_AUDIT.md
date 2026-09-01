# UI & Design System Audit

**Design Philosophy**: Modern AMOLED Dark · Glassmorphism · Tailored HSC Subject Accents · Clean Academic Typography

---

## 1. Color Palette Tokens

```css
:root {
  --bg: #071018;        /* AMOLED Deep Background */
  --panel: #0D1822;     /* Dark Glass Panel Background */
  --ink: #071018;       /* Primary Text on Light Badges */
  --mint: #57E0B7;      /* Primary Accent & Success (#57E0B7) */
  --sky: #6CB7FF;       /* Secondary Accent & Info (#6CB7FF) */
  --purple: #A58BFF;    /* Practice & Mathematics Accent */
  --coral: #FF8A76;     /* Biology & Warning Accent */
  --amber: #FBBF24;     /* Streaks & Star Ratings */
  --rose: #F43F5E;      /* Favorites & Errors */
}
```

---

## 2. Component Design Tokens

| Token Category | Values / Standards | Usage |
| :--- | :--- | :--- |
| **Border Radii** | `rounded-2xl` (16px), `rounded-[28px]` (28px), `rounded-[34px]` (34px), `rounded-full` | Cards, buttons, filter pills, and bottom sheets. |
| **Gradients** | `['#236D79', '#1A3358', '#111A27']`, `['#14283A', '#0C1720']` | Hero feature cards, subject cards, and sprint cards. |
| **Borders** | `border border-white/10`, `border border-white/8` | Glassmorphism card borders against deep background. |
| **Typography** | System Sans / Inter with weights `font-semibold`, `font-bold`, `font-black` | High-contrast readability on mobile screens. |
| **Iconography** | `@expo/vector-icons (Ionicons)` in mobile; `lucide-react` in Admin Studio | Consistent sizing (16px, 18px, 20px, 24px, 32px). |

---

## 3. Visual Consistency Findings

1. **Theme Harmonization**: The dark color palette is unified across Mobile (`#071018` / `#0B151E`) and Admin Studio (`#071018` / `#0B151E`).
2. **Subject Accents**: Consistently mapped across both apps:
   - Physics → Sky Blue (`#6CB7FF`)
   - Chemistry → Mint Green (`#57E0B7`)
   - Higher Math → Purple (`#A58BFF`)
   - Biology → Coral (`#FF8A76`)
3. **Touch Targets**: Buttons and card pressables adhere to minimum 44×44 pt touch targets for accessibility.
