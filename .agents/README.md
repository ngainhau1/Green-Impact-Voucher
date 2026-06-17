# Shared Agent Registry

This directory is the shared planning registry for Green Impact Voucher. It is intentionally tool-neutral and human-readable.

Runtime discovery still uses the official locations:

- OpenAI/Codex project guidance: `AGENTS.md`
- OpenAI/Codex custom agents: `.codex/agents/*.toml`
- Claude Code project context: `CLAUDE.md`
- Claude Code custom agents: `.claude/agents/*.md`

Use this directory to keep goals, roadmap, judging criteria, and reusable briefs aligned across tools.

## Files

- `project-brief.md`: product thesis, problem, solution, users, Stellar integration, and current proof.
- `roadmap.md`: one-month roadmap for strengthening the hackathon submission.
- `acceptance-criteria.md`: pass/fail checks for major features and submission quality.

## Operating Rule

If an implementation changes the product thesis, contract behavior, frontend flow, or submission narrative, update this registry and the matching runtime instruction files.
