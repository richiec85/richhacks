# RichHacks

Source for [richhacks.blog](https://richhacks.blog) — a content-first blog covering homelab,
security and AI practice: dark-mode-default, MDX posts, an auto-generated projects page pulled
live from GitHub, and SEO/structured data built in from the start.

## Stack

- **[Astro](https://astro.build)** (static output, no server/adapter) with the **MDX** integration
- **Tailwind CSS v4** via the official Vite plugin
- **[@astrojs/sitemap](https://docs.astro.build/en/guides/integrations-guide/sitemap/)** and a
  hand-written `/rss.xml` full-content feed (`src/pages/rss.xml.js`, using Astro's Container API
  to render MDX to HTML for the feed)
- **[sharp](https://sharp.pixelplumbing.com/)** for build-time image optimisation via `astro:assets`
- Node **22.12.0+** (pinned in `.node-version`), package manager **pnpm**

## Getting started

```sh
pnpm install
pnpm dev       # local dev server at localhost:4321
pnpm build     # production build to ./dist
pnpm preview   # serve the production build locally
```

## Environment variables

The `/projects` page fetches repos live from GitHub at **build time** (`src/lib/github.ts`).
Copy `.env.example` to `.env` and set:

```sh
GITHUB_USERS=your-username,second-account,third-account   # comma-separated
GITHUB_TOKEN=                                              # optional; read-only PAT
```

- `GITHUB_USERS` — comma-separated GitHub usernames to pull public repos from (forks and archived
  repos are skipped, results are de-duped and sorted by most recently pushed).
- `GITHUB_TOKEN` — optional. Without it you get unauthenticated (public-only, rate-limited)
  requests; with a classic PAT (`public_repo` scope, or `repo` to include private repos) you get
  a higher rate limit and private-repo access.
- If GitHub is unreachable or rate-limited at build time, the page never fails the build — it
  just renders an empty state.
- **Never commit `.env`** — it's git-ignored. Set the same two variables in your deploy
  platform's dashboard (see Deployment below).

## Content — adding a post

Posts are MDX files in `src/content/posts/`, validated against the schema in
`src/content.config.ts`. Frontmatter shape:

```yaml
---
title: "Post title"
description: "Under ~155 chars, symptom/concept-led — this is what search snippets and social
  previews show."
pubDate: 2026-07-01
updatedDate: 2026-07-15 # optional
pillar: "homelab" # homelab | security | ai | performance
postNumber: 3 # sequential, drives the #0003 tag in the EventStrip
status: "resolved" # optional: resolved | ongoing | reference
tags: ["proxmox", "zfs"]
draft: false
hero: "/some-image.png" # optional per-post OG image; falls back to /og-default.png
---
```

Drop the file in `src/content/posts/`, and it's automatically picked up by the homepage feed,
`/posts`, and `/posts/<slug>/` — no routing code to touch. Reading time is computed from the raw
MDX body at build time (`src/lib/reading-time.ts`), not stored in frontmatter.

## SEO / structured data

Every page runs through `src/components/BaseHead.astro`: canonical URL, Open Graph + Twitter
card (falling back to `/og-default.png` when no `hero` is set), and JSON-LD — `BlogPosting` for
posts, `WebSite` for other pages, both with a nested `Person` author.

Note: the site avatar (`src/assets/richard.jpg`) is AI-generated, disclosed on `/about`, and is
deliberately **not** referenced as `Person.image` in structured data or alt text elsewhere — it's
decorative branding, not a photo of the author.

## Security headers

`public/_headers` sets HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy and
Permissions-Policy for Cloudflare Pages. The Content-Security-Policy line is deliberately **not**
in that file — Astro inlines two small scripts directly into every page (dark-mode-flash
prevention and the theme toggle), and a strict CSP has to allowlist them by exact SHA-256 hash.
Hand-maintaining that hash would silently break the site the moment either script changed, so
`integrations/csp-headers.mjs` computes it from the real build output and injects the CSP line
into `dist/_headers` on every `pnpm build` — the hash can't go stale because it's never
hand-written.

## Deployment

Deploys to **Cloudflare Pages**:

| Setting | Value |
|---|---|
| Framework preset | Astro |
| Build command | `pnpm build` |
| Build output directory | `dist` |
| Root directory | `/` |

Set `GITHUB_USERS` and `GITHUB_TOKEN` as environment variables in the Pages dashboard (Settings →
Environment variables) — the build fetches GitHub at build time, so they need to be there before
the build runs, not just at runtime.
