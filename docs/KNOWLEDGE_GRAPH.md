# Knowledge Graph Foundation Architecture

**Specification**: `docs/KNOWLEDGE_GRAPH.md`  
**Applies To**: `apps/mobile`, `supabase`, `services/worker`  
**Purpose**: Unified academic relational graph linking subjects, chapters, concepts, formulas, textbook pages, and board questions.

---

## 1. Graph Entity & Node Types

```text
[Subject] ──▶ [Paper] ──▶ [Chapter] ──▶ [Concept] ──▶ [Formula]
                                                        │
         ┌──────────────────────────────────────────────┼──────────────────────────────┐
         ▼                                              ▼                              ▼
  [Textbook Page]                               [Board CQ Question]           [Board MCQ Question]
```

| Node Type | Canonical Identifier | Description |
| :--- | :--- | :--- |
| **Subject** | `physics`, `chemistry`, `mathematics` | Core HSC academic discipline |
| **Paper** | `1`, `2` | First or Second Paper |
| **Chapter** | `uuid` (`syllabus_chapters.id`) | Canonical NCTB chapter specification |
| **Concept** | `text` / `uuid` | Core academic concept (e.g. *Newtonian Kinematics*) |
| **Formula** | `uuid` (`formula_catalog.id`) | Canonical mathematical equation with LaTeX & variables |
| **BookPage** | `book_id` + `page_number` | Exact textbook page reference |
| **CQ Question**| `uuid` (`cq_catalog.id`) | Creative problem requiring equation |
| **MCQ Question**| `uuid` (`mcq_catalog.id`) | Multiple choice speed / derivation drill |

---

## 2. Whitelisted Edge / Relationship Types

| Edge Type | Origin Node | Target Node | Semantics |
| :--- | :--- | :--- | :--- |
| `CHAPTER_HAS_FORMULA` | Chapter | Formula | Chapter syllabus contains equation |
| `CONCEPT_HAS_FORMULA` | Concept | Formula | Formula derives or represents concept |
| `FORMULA_APPEARS_IN_BOOK`| Formula | BookPage | Formula appears on textbook page |
| `FORMULA_USED_IN_CQ` | Formula | CQ Question | Question requires equation for solve |
| `FORMULA_USED_IN_MCQ` | Formula | MCQ Question | Question tests formula or variable |
| `RELATED_TO` | Formula | Formula | Sibling equation in same derivation family |
| `DERIVED_FROM` | Formula | Formula | Child equation derived from fundamental law |

---

## 3. Storage Strategy
- **PostgreSQL Relational Schema**: Normalized tables with foreign keys and composite indexes (`formula_catalog`, `syllabus_chapters`, `content_packs`).
- **Zero-Cost Simplicity**: No external graph database overhead (Neo4j / Neptune). Queries use standard indexed joins.
- **Cycle & Depth Safety**: Graph traversals are bounded to depth `1` or `2` to prevent infinite recursion on self-referential concepts.
