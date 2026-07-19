<pre align="center">
███████╗██╗  ██╗██╗██╗     ██╗     ███████╗
██╔════╝██║ ██╔╝██║██║     ██║     ╚══███╔╝
███████╗█████╔╝ ██║██║     ██║       ███╔╝
╚════██║██╔═██╗ ██║██║     ██║      ███╔╝
███████║██║  ██╗██║███████╗███████╗███████╗
╚══════╝╚═╝  ╚═╝╚═╝╚══════╝╚══════╝╚══════╝
</pre>

<p align="center">
  <strong>The Open Source Skill Registry</strong>
  <br>
  Skills are reusable capabilities for AI agents. Install with a single command and compose your ideal workflow.
</p>

<p align="center">
  <a href="https://github.com/anomalyco/skillz">GitHub</a> &bull;
  <a href="#self-hosting">Self-hosting</a> &bull;
  <a href="#skill-spec">Skill Spec</a>
</p>

---

## Install the CLI

```bash
npx skillz setup      # configure your registry
npx skillz find       # browse available skills
npx skillz add owner/repo
```

See [CLI package →](packages/cli)

## Self-hosting

Run your own skillz registry with Docker:

```bash
docker compose up -d
```

The registry serves the web UI at `http://localhost:3000`. Point the CLI at it with `skillz setup`.

## Skill Spec

A skill is a single markdown file — `SKILL.md` — with YAML frontmatter:

```markdown
---
name: code-review
description: Review pull requests for common bugs and style issues
version: 1.0.0
---

# Code Review Skill

This skill helps you review code by checking for...
```

Publish via the web UI at `/publish` or with `skillz publish ./SKILL.md`.

## Tech Stack

| Layer         | Tech                                        |
| ------------- | ------------------------------------------- |
| Web framework | Next.js 15 (App Router)                     |
| API           | tRPC v11                                    |
| Database      | SQLite (libSQL + Drizzle ORM)               |
| Styling       | Tailwind CSS v4                             |
| CLI           | Commander + @inquirer/prompts + Chalk       |
| Dev tools     | TypeScript, ESLint 9, Prettier, Drizzle Kit |

## License

MIT
