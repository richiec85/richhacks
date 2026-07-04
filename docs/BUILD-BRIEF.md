# RichHacks — Claude Code Build Brief

Paste this into Claude Code (in Zed) as the project brief. It's written to be executed top to bottom to get an MVP live in one sitting.

---

## Mission

Build **RichHacks** — a fast, content-first personal blog for a cybersecurity/homelab practitioner. Dark-mode default, MDX posts, an auto-generated projects page sourced from multiple GitHub accounts, first-class SEO, deployed to Cloudflare Pages on `richhacks.blog`.

## Stack (use latest stable versions; pin them in package.json)

- **Astro** with the MDX integration
- **Tailwind CSS** (via the official Astro Tailwind setup)
- **@astrojs/sitemap** and **@astrojs/rss** for sitemap + RSS
- **astro-icon** or inline SVG for icons
- **Satori / astro-og-canvas** (or Astro's built-in OG approach) for auto-generated Open Graph images
- Node LTS. Package manager: pnpm preferred, npm fine.

## Repository layout

```
richhacks/
├── astro.config.mjs
├── tailwind.config.mjs
├── package.json
├── .env.example              # documents GITHUB_TOKEN, GITHUB_USERS — never commit real .env
├── src/
│   ├── content/
│   │   ├── config.ts         # content collections schema
│   │   └── posts/            # the MDX articles
│   ├── components/
│   │   ├── EventStrip.astro   # the signature metadata strip
│   │   ├── PostCard.astro     # log/incident-feed row
│   │   ├── ProjectCard.astro
│   │   └── BaseHead.astro     # SEO meta, OG, JSON-LD
│   ├── layouts/
│   │   ├── Base.astro
│   │   └── Post.astro
│   ├── lib/
│   │   └── github.ts          # build-time multi-account repo fetcher
│   ├── pages/
│   │   ├── index.astro
│   │   ├── posts/[...slug].astro
│   │   ├── posts/index.astro
│   │   ├── topics/[pillar].astro
│   │   ├── projects.astro
│   │   ├── about.astro
│   │   └── rss.xml.js
│   └── styles/
│       └── tokens.css         # design tokens as CSS variables
└── public/
    ├── fonts/                 # self-host the 3 typefaces
    └── favicon + logo
```

## Design tokens — put these in `src/styles/tokens.css` and drive everything from them

```css
:root {
  --ink:      #0B1220;   /* dark bg */
  --surface:  #131C2E;   /* cards, code */
  --paper:    #F7F6F2;   /* light-mode bg */
  --text:     #E6EAF2;   /* dark-mode text */
  --text-dim: #9AA7BD;   /* metadata, captions */
  --signal:   #E8912A;   /* brand accent - status-LED amber */
  --link:     #3BA9C9;   /* dashboard cyan */
  --uptime:   #3FB984;   /* status/success ONLY, sparingly */
  --hairline: #263247;   /* borders, rules */

  --font-display: "Space Grotesk", system-ui, sans-serif;
  --font-body:    "Newsreader", Georgia, serif;   /* serif for long-form prose */
  --font-mono:    "JetBrains Mono", ui-monospace, monospace;

  --measure: 68ch;       /* max reading width */
}
[data-theme="light"] {
  --ink: var(--paper);
  --surface: #FFFFFF;
  --text: #1A2230;
  --text-dim: #55607A;
  --hairline: #E2E0D8;
}
```
Self-host all three fonts from `/public/fonts` (don't hit Google Fonts at runtime — faster and GDPR-cleaner). Dark mode is the default; provide a toggle that respects `prefers-color-scheme` and remembers choice.

## Signature component — `EventStrip.astro`

Renders post metadata like a monitoring/changelog event, in mono:
```
[ HOMELAB ]  #0042  ·  12 min read  ·  2026-07-01  ·  status: resolved
```
- Category in brackets, coloured by pillar.
- Sequential post number (`#0042`) from frontmatter.
- Reading time (compute from content).
- ISO date.
- Optional `status:` field (resolved / ongoing / reference) — decorative-but-true for war-story posts.

The **home page** lists posts as these strips stacked into a log/incident feed, not conventional cards-with-thumbnails.

## Content schema — `src/content/config.ts`

```ts
import { defineCollection, z } from "astro:content";

const posts = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string(),          // used for SEO + OG
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    pillar: z.enum(["homelab", "security", "ai", "performance"]),
    postNumber: z.number(),           // for the #0042 strip
    status: z.enum(["resolved", "ongoing", "reference"]).optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    hero: z.string().optional(),
  }),
});

export const collections = { posts };
```

## GitHub projects loader — `src/lib/github.ts` (runs at build time)

```ts
// Reads GITHUB_USERS (comma-separated) and GITHUB_TOKEN from env.
// Merges public (and, if token has repo scope, private) repos across all accounts.
const USERS = (import.meta.env.GITHUB_USERS ?? "").split(",").map(s => s.trim()).filter(Boolean);
const TOKEN = import.meta.env.GITHUB_TOKEN;

export type Repo = {
  name: string; description: string | null; language: string | null;
  stars: number; url: string; pushedAt: string; topics: string[]; account: string;
};

export async function getProjects(): Promise<Repo[]> {
  const headers: Record<string,string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (TOKEN) headers.Authorization = `Bearer ${TOKEN}`;

  const all: Repo[] = [];
  for (const user of USERS) {
    try {
      // /user/repos when authenticated as that user surfaces private too;
      // /users/{user}/repos for the public list of other accounts.
      const res = await fetch(
        `https://api.github.com/users/${user}/repos?per_page=100&sort=pushed`,
        { headers }
      );
      if (!res.ok) continue;
      const repos = await res.json();
      for (const r of repos) {
        if (r.fork || r.archived) continue;
        // Optional: only surface repos tagged with the "blog-featured" topic:
        // if (!(r.topics ?? []).includes("blog-featured")) continue;
        all.push({
          name: r.name, description: r.description, language: r.language,
          stars: r.stargazers_count, url: r.html_url, pushedAt: r.pushed_at,
          topics: r.topics ?? [], account: user,
        });
      }
    } catch { /* fall through - never fail the build on GitHub */ }
  }
  // Sort most-recently-worked-on first; de-dupe by name+account.
  const seen = new Set<string>();
  return all
    .filter(r => (seen.has(r.account+"/"+r.name) ? false : seen.add(r.account+"/"+r.name)))
    .sort((a,b) => +new Date(b.pushedAt) - +new Date(a.pushedAt));
}
```
`.env.example`:
```
GITHUB_USERS=richiec85,SECOND_ACCOUNT,THIRD_ACCOUNT
GITHUB_TOKEN=            # classic PAT, read-only. public_repo scope, or repo scope to include private
```
Set the same two vars in **Cloudflare Pages → Settings → Environment variables** so production builds can fetch. Add a build-output cache of the last good result so a rate-limit never breaks a deploy.

## SEO requirements (build these in from day one)

- `<BaseHead>` on every page: title, description, canonical, Open Graph + Twitter card, and **JSON-LD** (`BlogPosting` for posts, `Person`/`WebSite` for home/about).
- Auto-generated **OG image** per post (title + pillar + `#number` on the ink background).
- `@astrojs/sitemap` for `sitemap-index.xml`; submit to Google Search Console + Bing after launch.
- **Full-content RSS** at `/rss.xml`.
- Semantic HTML, one `<h1>` per page, descriptive alt text.
- Lighthouse target: 95+ on Performance, Accessibility, Best Practices, SEO. Verify before calling the MVP done.

## Accessibility & quality floor

Responsive to 360px; visible keyboard focus rings; `prefers-reduced-motion` respected; colour contrast AA on both themes; images lazy-loaded.

## Deployment

1. Push repo to GitHub.
2. Cloudflare Pages → connect repo → framework preset **Astro** → build `astro build`, output `dist`.
3. Add both custom domains: `richhacks.blog` (primary) and `richhacks.me`.
4. **`richhacks.me`:** set a 301 redirect to `richhacks.blog` for now (Cloudflare Redirect Rule) — split into a real landing page in Phase 2.
5. Set `GITHUB_USERS` + `GITHUB_TOKEN` env vars in Pages.
6. Confirm HTTPS, RSS, sitemap and the projects page all resolve.

## Definition of done — Phase 0 MVP

- [ ] `richhacks.blog` live over HTTPS, dark-mode default with working light toggle.
- [ ] Home page renders posts as the log/incident feed with EventStrips.
- [ ] At least **one real post** published (the Proxmox outage post-mortem).
- [ ] `/about` page live.
- [ ] `/projects` auto-generated from at least one GitHub account (all three once usernames are supplied).
- [ ] `/rss.xml` and sitemap valid.
- [ ] Per-post OG images generating.
- [ ] Lighthouse 95+ across the board.
- [ ] `richhacks.me` redirects to `richhacks.blog`.

## Phase-0 task order for Claude Code

1. Scaffold Astro + Tailwind + MDX; wire `tokens.css` and self-hosted fonts.
2. Build `Base` + `Post` layouts, `BaseHead`, and the `EventStrip` signature component.
3. Content collection schema + one seed post (I'll paste the Proxmox draft; convert to MDX with correct frontmatter).
4. Home (log feed), posts index, topic pages, about.
5. `github.ts` + `projects.astro`.
6. RSS, sitemap, OG images, JSON-LD.
7. Local Lighthouse pass + fixes.
8. Push → Cloudflare Pages → both domains → env vars → verify.

---

**Two things to hand Claude Code alongside this brief:** (1) your other two GitHub usernames, and (2) your existing Proxmox write-up to convert into the first post. Everything else it can generate from the above.

