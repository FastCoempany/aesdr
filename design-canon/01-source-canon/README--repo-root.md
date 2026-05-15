# AESDR Course Factory

This repo now uses a purpose-based layout instead of mixing app code, lesson HTML, planning docs, and standalone assets at the root.

## Source Of Truth

- `content/lessons/html/` is the current canonical lesson-content source.
- `tools/standalone-html/` holds the standalone learner tools that can later be embedded into lessons or migrated into the app.
- `marketing/` holds landing pages and ad-creative assets.
- `aesdr-app/` is the product app shell and integration layer for auth, progress, persistence, and future lesson delivery.
- `docs/` is reference and planning material, not production runtime content.
- `archive/` is historical material only. Do not build new work against it.

## Repo Map

```text
.
|-- aesdr-app/
|-- content/
|   `-- lessons/
|       `-- html/
|           |-- lesson-01/
|           |-- lesson-02/
|           |-- lesson-03/
|           |-- lesson-04/
|           |-- lesson-05/
|           |-- lesson-06/
|           |-- lesson-07/
|           |-- lesson-08/
|           |-- lesson-09/
|           |-- lesson-10/
|           |-- lesson-11/
|           `-- lesson-12/
|-- tools/
|   `-- standalone-html/
|-- marketing/
|   |-- ad-creative/
|   `-- landing-pages/
|-- docs/
|   |-- planning/
|   `-- strategy/
|-- archive/
|   |-- empty-folders/
|   `-- external-workspaces/
|-- AGENTS.md
|-- CLAUDE.md
`-- README.md
```

## Where To Work

- Lesson copy, screens, and exercises: `content/lessons/html/`
- Reusable calculators, trackers, frameworks, printable builders: `tools/standalone-html/`
- Landing pages and messaging experiments: `marketing/`
- App routing, auth, Supabase, progress, dashboards: `aesdr-app/`
- Launch planning, audits, and strategy notes: `docs/`

## App Commands

Run the app from `aesdr-app/`.

```bash
cd aesdr-app
npm install
npm run dev
```

## Working Rules

- Keep new top-level clutter out of the repo root.
- Prefer lowercase kebab-case for new folders and files.
- Treat `archive/` as read-only history unless something is being intentionally restored.
- If lesson delivery moves fully into the app later, migrate from `content/lessons/html/` instead of creating a second live lesson system somewhere else.
