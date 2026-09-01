# Universal AI Content Import

Give this instruction to Antigravity/Gemini/ChatGPT/Claude when converting notes into app content:

> Produce UTF-8 JSONL. One JSON object per line. Follow `schemas/content-item.schema.json`. Never invent a subject/chapter ID if unknown; use a human-readable chapter name and `confidence`. Preserve source/provenance. Do not output React components or SQL. The platform converts structured data into cards and database/content packs.

Example:

```jsonl
{"type":"formula","subject":"physics","paper":1,"chapter":"motion","title":"First equation of motion","latex":"v=u+at","importance":5,"confidence":0.99,"source":"teacher-sheet-01"}
{"type":"cq","subject":"physics","paper":1,"chapter":"motion","question":"A car starts from rest...","board":"Dhaka","year":2025,"difficulty":3,"confidence":0.93,"source":"board-2025"}
```

Upload the resulting file to Admin Studio. Do not ask the AI to connect to Supabase service-role credentials.
