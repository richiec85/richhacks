# CLAUDE.md — RichHacks

Project-level instructions for Claude Code. This sits at the repo root and is read automatically
at the start of every session. It **adds to** my global `~/.claude/CLAUDE.md` (UK spelling,
security-first, plan-before-large-changes — all still apply).

> Full detail — exact code for the GitHub loader, Astro config, and OG images — is in
> `docs/BUILD-BRIEF.md`. Read it when you need the specifics; this file is the working summary.

## What we're building

**RichHacks** — a fast, content-first personal blog for a cybersecurity / homelab practitioner.
Dark-mode default, MDX posts, an auto-generated projects page sourced from multiple GitHub
accounts, first-class SEO. Deploys to Cloudflare Pages on `richhacks.blog`.

**Voice/brand:** practitioner-engineer's notebook. Precise, honest, war-stories from the rack.
Not "hacker" clichés — no black-and-acid-green terminal aesthetic.

## Stack (use latest stable; pin versions in package.json)

- **Astro** + MDX integration — the core.
- **Tailwind CSS** via the official Astro setup, driven by the design tokens below.
- **@astrojs/sitemap** and **@astrojs/rss**.
- OG image generation per post (astro-og-canvas or Satori).
- Node LTS. Package manager: **pnpm** preferred (npm is fine).

## Commands

```bash
pnpm install        # first time
pnpm dev            # local dev server — use this to preview as we build
pnpm build          # production build
pnpm preview        # serve the built site locally
```

## Repo structure (target)

```
src/
├── content/
│   ├── config.ts          # content collection schema (below)
│   └── posts/             # the MDX articles
├── components/
│   ├── EventStrip.astro   # signature metadata strip
│   ├── PostCard.astro     # a row in the log/incident feed
│   ├── ProjectCard.astro
│   └── BaseHead.astro     # SEO meta, OG, JSON-LD
├── layouts/{Base,Post}.astro
├── lib/github.ts          # build-time multi-account repo fetcher (code in BUILD-BRIEF)
├── pages/
│   ├── index.astro        # home = log/incident feed of posts
│   ├── posts/[...slug].astro, posts/index.astro
│   ├── topics/[pillar].astro
│   ├── projects.astro, about.astro
│   └── rss.xml.js
└── styles/tokens.css
```

## Design tokens (put in src/styles/tokens.css; everything reads from these)

```css
:root {
  --ink:#0B1220; --surface:#131C2E; --paper:#F7F6F2;
  --text:#E6EAF2; --text-dim:#9AA7BD;
  --signal:#E8912A;   /* brand accent — status-LED amber */
  --link:#3BA9C9;     /* dashboard cyan */
  --uptime:#3FB984;   /* status/success ONLY, sparingly */
  --hairline:#263247;
  --font-display:"Space Grotesk", system-ui, sans-serif;
  --font-body:"Newsreader", Georgia, serif;   /* serif for long-form prose */
  --font-mono:"JetBrains Mono", ui-monospace, monospace;
  --measure:68ch;
}
```
Dark mode is the **default**; provide a toggle that respects `prefers-color-scheme` and remembers
the choice. Self-host the three fonts from `/public/fonts` (don't hit Google Fonts at runtime).

## Signature component — EventStrip

Renders post metadata like a monitoring/changelog event, in mono:
`[ HOMELAB ]  #0042  ·  12 min read  ·  2026-07-01  ·  status: resolved`
The **home page** stacks these into a log/incident feed instead of conventional cards.

## Content schema — src/content/config.ts

```ts
import { defineCollection, z } from "astro:content";
const posts = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    pillar: z.enum(["homelab","security","ai","performance"]),
    postNumber: z.number(),
    status: z.enum(["resolved","ongoing","reference"]).optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    hero: z.string().optional(),
  }),
});
export const collections = { posts };
```

Post #1 already exists: `how-one-nic-took-down-my-proxmox-cluster.mdx` — place it in `src/content/posts/`.

## GitHub projects page

Auto-generated at **build time** from env vars — never fail the build if the API is down (cache
the last good result). Full loader code is in `docs/BUILD-BRIEF.md`.
- `GITHUB_USERS` = comma-separated usernames (one is `richiec85`; I'll supply the other two).
- `GITHUB_TOKEN` = read-only PAT. Read from env / `.env` locally, and set in Cloudflare Pages.
- **Never commit the token or a `.env` file.**

## SEO (build in from the start)

`BaseHead` on every page (title, description, canonical, OG + Twitter card, JSON-LD:
`BlogPosting` for posts, `Person`/`WebSite` for home/about). Per-post OG images. Sitemap. Full RSS
at `/rss.xml`. Target Lighthouse 95+ across the board before calling the MVP done.

## Guardrails

- Never hard-code secrets; use env vars. Never commit `.env` or the PAT.
- Homelab addressing (`10.10.10.x`) is fine to show in posts. Client/work environments never appear.
- Small, reviewable commits — commit after each working chunk so we can roll back cleanly.

## Build order (tick these off)

- [ ] Scaffold Astro + Tailwind + MDX; wire `tokens.css` + self-hosted fonts.
- [ ] `Base` + `Post` layouts, `BaseHead`, `EventStrip`.
- [ ] Content schema + add post #1 (the Proxmox MDX).
- [ ] Home (log feed), posts index, topic pages, about.
- [ ] `github.ts` + `projects.astro`.
- [ ] RSS, sitemap, OG images, JSON-LD.
- [ ] Local Lighthouse pass + fixes.
- [ ] Push → Cloudflare Pages → both domains → env vars → verify.

Work through these in order. Pause after scaffolding so I can run `pnpm dev` and see it before we go further.
