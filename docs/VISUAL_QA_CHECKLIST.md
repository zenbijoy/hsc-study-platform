# Visual QA & Regression Checklist

**Test Route**: `/dev/design-system` (Component Gallery)  
**Target Environments**: Android (320px, 360px, 390px, 430px) & iOS  

---

## 1. Theme & Color Matrix
- [ ] **AMOLED Dark Mode**: Background `#071018`, surface `#0D1822`, text `#FFFFFF`, zero low-contrast gray glows.
- [ ] **Academic Light Mode**: Background `#F8FAFC`, surface `#FFFFFF`, text `#0F172A`, borders clearly visible.
- [ ] **Reader Themes**: AMOLED Black, Warm Sepia, Midnight Blue, Crisp Light.

---

## 2. Typography & Bengali Glyphs
- [ ] **Bangla Conjuncts (যুক্তবর্ণ)**: `পদার্থবিজ্ঞান`, `বলবিদ্যা`, `ক্যালকুলাস`, `ইলেকট্রন` render without clipped ascenders or descenders.
- [ ] **Mathematical Equations**: LaTeX expressions (`s = ut + ½at²`, `F = ma`) align correctly in formula hero boxes.
- [ ] **Ellipsis & Wrapping**: Long textbook titles truncate cleanly at 2 lines without overflowing container boundaries.

---

## 3. Responsive Screen Widths
- [ ] **Small Phone (320px - 360px)**: 2-column grids adapt cleanly; buttons and touch targets maintain minimum 44×44 pt size.
- [ ] **Standard Phone (390px - 430px)**: Generous whitespace and padding rhythm (`16px` gutters).

---

## 4. State & Feedback Checks
- [ ] **Button States**: `idle` → `pressed` (scale 0.985) → `loading` (spinner + text) → `disabled` (50% opacity).
- [ ] **Skeleton Shimmers**: Animated pulse runs smoothly without UI thread lag.
- [ ] **Empty States**: Clear iconography, student-friendly headline, and actionable primary CTA button.
- [ ] **Inline & Fullscreen Errors**: Clear description and functional "Try Again" retry action.
- [ ] **Offline Banner**: Compact status banner visible when disconnected from internet.
