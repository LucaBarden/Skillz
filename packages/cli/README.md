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
  Discover, install, and manage AI agent skills — right from your terminal.
</p>

<p align="center">
  <a href="#install">Install</a> &bull;
  <a href="#quick-start">Quick Start</a> &bull;
  <a href="#commands">Commands</a> &bull;
  <a href="#skill-spec">SKILL.md</a>
</p>

---

## Install

```bash
npm install -g skillz
```

Or just run it on the fly:

```bash
npx skillz
```

## Quick Start

```bash
# one-time setup — configure your registry and skills directory
skillz setup

# browse what's out there
skillz find

# grab a skill
skillz add anomalyco/code-review

# see what you've got
skillz list

# pull the latest versions
skillz update

# clean up what you don't need
skillz remove
```

## Commands

| Command | Alias | What it does |
|---------|-------|--------------|
| `setup` | — | Configure registry URL and default skills directory |
| `find [query]` | `search` | Search the registry. Leave empty to browse all skills |
| `add <owner/repo>` | `install` | Install a skill. Use `-g` to skip the directory prompt |
| `list` | `ls` | List every skill you've installed locally |
| `update` | `up` | Check all installed skills for newer versions and upgrade them |
| `remove` | `rm` | Toggle-select skills to uninstall |
| `publish <file>` | — | Ship your own SKILL.md to the registry |

## Skill Spec

A skill is just a markdown file — `SKILL.md` — with a tiny bit of YAML frontmatter.

```markdown
---
name: code-review
description: Review pull requests for common bugs and style issues
version: 1.0.0
---

# Code Review Skill

This skill helps you review code by checking for common patterns...
```

That's it. Publish with `skillz publish ./SKILL.md` and the world can `skillz add` your skill.

## License

MIT
