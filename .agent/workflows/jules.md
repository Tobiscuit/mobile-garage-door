---
description: how to create and submit Jules tasks for this project
---

# Jules Task Workflow

Jules is Google's AI coding agent. It works through GitHub — you give it a task, it creates a PR.

## Setup (one-time)

// turbo
```bash
npm install -g @google/jules
```

## Creating a Jules Task

Prompts live in `.jules/` directory as markdown files.

### From CLI (preferred)

Pipe the prompt file into `jules new`:

// turbo
```bash
cat .jules/<prompt-file>.md | jules new --repo Tobiscuit/mobile-garage-door
```

Example:
// turbo
```bash
cat .jules/phase1-vinext-migration.md | jules new --repo Tobiscuit/mobile-garage-door
```

Or inline:
// turbo
```bash
jules new "write unit tests for the auth module"
```

### Useful Commands

// turbo
```bash
jules                                        # Launch interactive TUI
jules remote list --session                  # List all sessions
jules remote list --repo                     # List all repos
jules remote pull --session <id>             # Pull result
jules remote pull --session <id> --apply     # Pull and apply patch locally
```

## Asking Antigravity to Create a Jules Prompt

Say something like:
- "Create a Jules prompt for [description of work] and save it to `.jules/`"
- "Write a Jules task to refactor the auth layer"
- "Break [this feature] into Jules phases and save the prompts"

Antigravity will:
1. Research the codebase to write an informed prompt
2. Save the prompt to `.jules/<descriptive-name>.md`
3. Give you the exact `jules new` CLI command to run

## Current Prompts

- `.jules/phase1-vinext-migration.md` — Migrate Next.js → Vinext

## Notes

- Jules does NOT have access to env vars or secrets — it only works with code
- Jules runs in a sandboxed Google Cloud VM with your repo cloned
- For large changes, break into phases (separate prompts/issues)
- Jules creates a PR that you review before merging
- Use `--parallel N` to run up to 5 parallel sessions on the same task
