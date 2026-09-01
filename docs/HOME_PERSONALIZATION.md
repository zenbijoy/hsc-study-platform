# Home Screen Personalization & Recommendation Model

**Version**: 1.0 (Deterministic Rules Engine)  
**Applies To**: `apps/mobile/src/features/home/`

---

## 1. Overview

The Home screen personalization engine delivers a tailored experience for each HSC student without requiring external AI service latency or expensive remote recommendation queries on every app launch.

---

## 2. Personalization Factors

1. **Student Academic Batch**: `HSC 2026`, `HSC 2027`, `HSC 2028`
2. **Academic Group**: `Science`, `Business Studies`, `Humanities`
3. **Education Board**: `Dhaka`, `Rajshahi`, `Chattogram`, `Cumilla`, etc.
4. **Preferred Subjects**: User-selected prioritized subjects list
5. **Study Focus**: `textbooks`, `formulas`, `board_cq`, `mcq_practice`, `revision`
6. **Active Reading Progress**: Unfinished book bookmarks and chapter positions

---

## 3. Deterministic Recommendation Algorithm

```typescript
score =
  (isPreferredSubject ? 50 : 0) +
  (hasUnfinishedProgress ? 30 : 0) +
  (isCoreSubject ? 15 : 0) +
  (isFormulaDense ? 10 : 0);
```

- **Preferred Subject Match (+50 pts)**: Prioritizes books matching the student's selected subjects.
- **Unfinished Reading (+30 pts)**: Promotes books that the student has actively opened and read partially (`0 < progress < 100`).
- **Core Subject Priority (+15 pts)**: Physics, Chemistry, and Higher Math receive slight base priority.
- **Formula Density (+10 pts)**: Textbooks with rich mathematical formulas are promoted.

---

## 4. Deterministic Formula of the Day

```typescript
const dayOfYear = Math.floor((now - startOfYear) / MS_PER_DAY);
const formulaPool = formulas.filter(f => preferredSubjects.includes(f.subjectId));
const dailyFormula = formulaPool[dayOfYear % formulaPool.length];
```

- Stable for 24 hours (does not change on app re-render or reload).
- Filters for student's chosen academic subjects first.

---

## 5. Time-Based Greetings

| Device Local Hour | Greeting Format |
|---|---|
| 04:00 – 11:59 | *Good morning, {name} 👋* |
| 12:00 – 16:59 | *Good afternoon, {name} 👋* |
| 17:00 – 21:59 | *Good evening, {name} 👋* |
| 22:00 – 03:59 | *Ready for late-night study, {name}? 👋* |

---

## 6. Future AI Interface Boundary

```typescript
export interface RecommendationProvider {
  getRecommendations(context: StudentAcademicContext): Promise<Book[]>;
}
```
Currently implemented by `RulesRecommendationProvider` (`personalizationRules.ts`).
