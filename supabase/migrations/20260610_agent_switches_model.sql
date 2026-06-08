-- Per-agent model preference, stored alongside the on/off switch.
-- Additive. Only the LLM-calling agents (scout, dossier-enrich) actually read
-- this — the deterministic crons ignore it (no LLM, no model). Null means
-- "use the code's default for that agent."
--
--   scout         default: claude-sonnet-4-6  (volume work)
--   dossier-enrich default: claude-opus-4-6   (judgment work)

alter table agent_switches add column if not exists model text;
