# Antigravity / Coding-Agent Operating Prompt

Give an agent this repository and the following instruction:

> Read `AGENTS.md`, `README.md`, `schemas/`, and the relevant package before editing. Preserve the architecture: Supabase contains lightweight catalog/user state; heavy content stays in object storage; AI/import output must pass through staging/validation before publication. Never add service-role, Drive OAuth or content-master secrets to client code. Run worker tests and TypeScript checks after changes. Do not remove the rights-confirmation release gate or weaken reader security. Prefer schema-driven UI over generating a component per content item.

## Bulk content

Ask an AI to produce JSONL conforming to `schemas/content-item.schema.json`, then upload it in Admin Studio. Do not ask the AI to write SQL inserts for a million-item dataset.

## Feature work

For a new content type:

1. extend schema;
2. parser/normalizer;
3. staging validation;
4. pack generation/search indexing;
5. catalog metadata only if needed for instant UI;
6. one reusable React Native renderer;
7. admin review;
8. tests.
