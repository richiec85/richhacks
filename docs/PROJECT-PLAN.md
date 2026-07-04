# RichHacks — Project Plan & Roadmap

**Owner:** Richard Carragher (RC COMMS)
**Domains:** `richhacks.blog` (primary) · `richhacks.me` (personal landing / redirect)
**Goal:** Operational blog live within days; a monetisable content asset over 3–6 months.
**Constraint:** Sustainable alongside a full-time role, MSc wrap-up, homelab, family and the shop. Consistency beats volume.

---

## 1. Brand

**RichHacks** works on three levels at once: your name (Rich), technical *hacks*, and life/health optimisation. That range is a feature — it lets the blog cover homelab, security *and* the over-40 performance angle later without a rebrand.

- **Positioning:** a practitioner-engineer's notebook. Not script-kiddie "hacker" aesthetics — enterprise-grade, MSc-backed, war-stories-from-the-rack. Trust and precision are the brand.
- **Voice:** first-person, specific, honest about what broke. "Here's what took my cluster down and exactly how I got it back" beats "10 tips for Proxmox".
- **Tagline options:** *"Notes from the rack."* / *"Infrastructure, security, and everything I've broken."* / *"Field notes on homelab, security & AI."*

### Domain strategy
- `richhacks.blog` → the blog. All content lives here so every ranking signal builds one domain.
- `richhacks.me` → a one-page personal/about + CV/portfolio landing, OR a 301 redirect to `richhacks.blog/about`. Recommendation: start as a **301 redirect** (zero maintenance), split it out into a proper personal landing page in Phase 2 if you want a professional "hire me / speak to me" front door.

---

## 2. Tech stack (and why)

| Layer | Choice | Why |
|---|---|---|
| Framework | **Astro** (latest stable) | Content-first, ships zero JS by default, excellent Core Web Vitals + SEO, native MDX. Fits a technical audience and your git/markdown workflow. |
| Content | **MDX** files in the repo | Posts are just markdown in git — basically what your Joplin/Nextcloud notes already are. Full ownership, portable forever. |
| Styling | **Tailwind CSS** + CSS custom properties | Fast, consistent, easy for Claude Code to work in. Design tokens defined once (see §4). |
| Hosting | **Cloudflare Pages** (free tier) | Free, global edge, automatic HTTPS, easy custom domains, built-in analytics, and — relevant for a *security* blog that may attract attention — DDoS protection out of the box. |
| Repo | New dedicated GitHub repo | Push to main → auto-deploy. This is your existing workflow. |
| Newsletter (later) | Buttondown free tier or Cloudflare + Resend | Bolt on in Phase 1/2 once there's anyone to email. Don't gate launch on it. |

**Why not WordPress/Ghost/Substack:** monthly fees or revenue cuts, more maintenance, and a subdomain SEO penalty (Substack). You already have the skills to own the whole stack — this plays to them.

---

## 3. Information architecture (site map)

```
richhacks.blog
├── /                     Home — latest posts as a "log/incident feed" (see signature, §4)
├── /posts/               All posts, filterable by pillar
│   └── /posts/{slug}     Individual article
├── /topics/{pillar}      Homelab · Security · AI/LLMs · (later) Over-40 Performance
├── /projects             Auto-generated from your 3 GitHub accounts (see §5)
├── /about                Who you are, the MSc, RC COMMS, contact
├── /now                  Optional: what you're currently working on (nownownow.com style)
├── /rss.xml              Full-content RSS feed
└── /sitemap-index.xml    Auto-generated
```

---

## 4. Design direction

Deliberately **not** the "black terminal + acid-green" hacker cliché. The reference points are your actual world: monitoring dashboards (Grafana), rack units, network topology, and Audi-grade engineering restraint. Dark-mode default (the audience lives in dark mode), with a clean light mode.

**Palette — "instrument panel"**
| Token | Hex | Use |
|---|---|---|
| `--ink` | `#0B1220` | Dark background (deep slate-navy, not pure black) |
| `--surface` | `#131C2E` | Cards, code blocks, raised surfaces |
| `--paper` | `#F7F6F2` | Light-mode background |
| `--text` | `#E6EAF2` | Primary text (dark mode) |
| `--signal` | `#E8912A` | Brand accent — a warm "status LED / warning light" amber |
| `--link` | `#3BA9C9` | Links & interactive (dashboard cyan) |
| `--uptime` | `#3FB984` | Status/success only, used sparingly (never as the brand colour) |
| `--hairline` | `#263247` | Borders, dividers, rules |

**Typography — three deliberate roles**
- **Display / UI:** Space Grotesk (engineering confidence, a little character)
- **Body / long-form:** Newsreader or Source Serif 4 — a *serif* for article prose. Unusual for a dev blog, and it genuinely improves readability on your long technical reads while differentiating from every Inter-default blog out there.
- **Mono / data:** JetBrains Mono — code blocks *and* the metadata strip below.

**Signature element — the "event strip"**
Each post is framed like a monitoring event / changelog entry, because that's what your content honestly is (post-mortems, changelogs, war-stories):

```
[ HOMELAB ]  #0042  ·  12 min read  ·  2026-07-01  ·  status: resolved
```

The home page renders the post list as a **log/incident feed** — monospace metadata, category as a status-style tag. It's memorable, it's true to the content, and it's structure carrying real information rather than decoration.

---

## 5. GitHub integration (your 3 accounts)

The `/projects` page is **auto-generated at build time** from the GitHub API across all three of your accounts — so it stays current with zero manual upkeep.

**What Claude Code needs from you:**
1. The **three GitHub usernames** (one is `richiec85`; supply the other two).
2. A **Personal Access Token** (classic, read-only `public_repo` scope — or `repo` scope if you want it to surface **private** repos too), stored as a Cloudflare Pages environment variable `GITHUB_TOKEN`. Never commit it.

**Behaviour:**
- Fetch repos from each account, merge, de-duplicate, sort by "pushed_at" (most recently worked-on first) or stars.
- Show: name, description, primary language, stars, last-updated, topics/tags, link.
- Optional curation: an allow-list or a `blog-featured` GitHub *topic* you add to repos you want surfaced, so half-finished experiments stay hidden.
- Graceful fallback: if the API is rate-limited or down at build time, use the last successfully cached list so a build never fails on it.

This turns your 34 years of accumulated tooling (PowerShell sysadmin toolkit, the Entra ID audit tool, the PubMed RAG scripts, homelab configs) into a living portfolio automatically.

---

## 6. Content strategy

### Pillars
1. **Homelab war-stories** — your strongest, most searchable material. The Proxmox two-node cluster outage (NIC rename → corosync/ZFS chaos → `init=/bin/bash` recovery → MAC-pinned `.link` files → kernel pinning) is a genuinely excellent first post: specific, painful, and exactly what people Google at 2am. Also: the 8.4→9.1 upgrade, Eurooffice/ONLYOFFICE healthcheck fix, Arc A310 vs T400 for Plex/Immich, ROCm-on-Fedora pain.
2. **Practitioner Zero Trust / NIS2 for MSPs** — your differentiator. Nobody in the homelab space has an MSc-Distinction, dissertation-backed take on ZTA within ISMS frameworks for multi-tenant MSPs. Break the dissertation into a practical 4–5 part series, translated out of academic register.
3. **AI tooling for sysadmins** — local LLM/RAG (AnythingLLM + Qwen, distributed llama.cpp inference across the Minisforum cluster, the PubMed→RAG pipeline). Sits on the AI × security intersection, which is what both readers and sponsors care about most right now.
4. **(Phase 3, optional) Over-40 performance & "single pane of glass"** — only if you want the brand to stretch there. The "hacks" name already licenses it.

### Launch content (adapt, don't write from scratch)
You've already written most of this. Launch = editing.
- **Post 1:** The Proxmox cluster outage post-mortem (Homelab).
- **Post 2:** Part 1 of the ZTA/NIS2 series — "What Zero Trust actually means for a small MSP" (Security).
- **Post 3:** Running a local LLM + RAG on your own hardware (AI).
- Plus the **/about** page and the auto-built **/projects** page.

### Cadence
Target **one post every 1–2 weeks**. Publish Post 1 on launch day; keep 2–3 in the drafts pipeline so a busy fortnight never breaks the streak. Batch-write when you have energy, release on a schedule.

---

## 7. Roadmap

| Phase | Timeframe | Objectives | Definition of done |
|---|---|---|---|
| **0 — MVP live** | Days 1–3 | DNS on both domains; Astro scaffold + design tokens; deploy to Cloudflare Pages; 1 launch post + About + Projects page live | `richhacks.blog` resolves over HTTPS with a real post, working RSS, and the GitHub projects page |
| **1 — Foundation** | Weeks 1–4 | Polish design & dark/light modes; analytics; OG images; sitemap/schema; Amazon Associates UK; publish Posts 2–3; seed to Reddit/LinkedIn/HN | 3–4 posts live; first affiliate links in; first inbound traffic |
| **2 — Growth & repurposing** | Months 2–3 | Full pillar cadence; social repurposing (LinkedIn + optional Reels/Shorts); newsletter capture; split `richhacks.me` into a real personal landing page | Consistent fortnightly posts; a small but real subscriber list; growing search impressions |
| **3 — Monetise & authority** | Months 3–6 | Complete the ZTA/NIS2 series as a flagship lead-magnet; open to sponsored content; formalise a **Qualcom** advertising/sponsorship arrangement; evaluate the over-40 spin-off | First sponsored/affiliate income; Qualcom partnership live; established topical authority |

---

## 8. Social media — should you do TikTok / Instagram?

**Honest answer: not as your primary channels, but there's a real secondary opportunity.**

Deep technical content lives or dies on different platforms than lifestyle content. Priority order for *your* audience:

1. **LinkedIn** (you're already there, and the MSc-Distinction announcement audience is exactly right) — highest-value channel. Post a short take + link on every article.
2. **Reddit** — r/homelab, r/selfhosted, r/sysadmin, r/msp. This is where your war-stories will actually spread. Contribute genuinely, don't just drop links.
3. **Hacker News** — the Proxmox post is a natural fit; one front-page hit is worth months of other traffic.
4. **X/Twitter + Mastodon/Bluesky (Fediverse)** — the infosec/homelab community is active here.

**Instagram & TikTok:** the homelab world *is* surprisingly visual (rack shots, cable management, "what broke this week" clips do well as Reels/Shorts). So treat them as **Phase 2, repurpose-only** — never create bespoke content for them. One article becomes: a LinkedIn post, an Instagram carousel (screenshots + the money quote), and a 45–60s vertical "I broke my cluster, here's the fix" clip that goes to Reels + TikTok + YouTube Shorts simultaneously. If it costs you more than 20 minutes per post, it's not worth it at your stage.

### What I (Claude) can and can't do here — being straight with you
- **I cannot auto-post** to TikTok, Instagram, or LinkedIn — there's no connector wired up for that, so nothing publishes on your behalf.
- **I can draft everything:** captions, hooks, hashtag sets, carousel copy, video scripts/shot-lists, and a posting calendar — you then either paste-and-post, or load them into a scheduler (Buffer, Metricool, or Later all have free/cheap tiers) that posts on a timer.
- **"SEO for social" isn't classic SEO** — these platforms rank on hooks, watch-time, captions, hashtags and posting time, not backlinks. I optimise *those* levers. Classic SEO (search rankings) is what the blog itself is built for.

A couple of sample drafts are in §11 to show the shape of it.

---

## 9. Monetisation

Roughly in the order each becomes realistic:
1. **Amazon Associates UK** — trivial to set up; you're already buying/reviewing the hardware (GPUs, mini-PCs, NAS), so links are natural.
2. **Infra/software affiliates** — Hetzner, OVH, Backblaze and similar all run referral programmes that fit a homelab audience.
3. **Qualcom** — you've said they might advertise. This is a genuine early win most bloggers don't have: a warm first sponsor. Options — a tasteful "sponsored by" placement, a co-branded piece, or Qualcom-funded deep-dives. Keep it clearly labelled as sponsored (ASA rules in the UK/NI require it).
4. **Sponsored content (other vendors)** — realistically Phase 3, once traffic is consistent. Security/MSP tooling vendors pay for genuine practitioner reviews.

---

## 10. Compliance guardrails (even with work's sign-off)

Work being "OK from the ISO and GDPR perspective" clears the big hurdle. Keep these habits anyway so it stays that way:
- **Anonymise & generalise** all client/audit war-stories. `FSWDOMAIN.local`, the SonicWall change request, real IP ranges, hostnames and the property-sale specifics never appear. Reconstruct the *lesson*, not the environment.
- **No live secrets** — scrub tokens, keys, internal URLs, MAC/IP addresses from screenshots and code blocks. Your homelab `10.10.10.x` addressing is fine to show (RFC1918, non-identifying); client environments are not.
- **ISO 27001 alignment** — if Qualcom holds certification, a quick nod from whoever owns the ISMS on the sponsorship/publishing arrangement keeps you clean.
- **GDPR on your side** — if you add a newsletter or comments, you're now a data controller: a plain privacy notice, explicit opt-in, and a real unsubscribe. Cloudflare Analytics is cookieless, which keeps the cookie-banner burden near zero at launch.
- **ASA/advertising** — label sponsored and affiliate content clearly ("#ad", "contains affiliate links").

---

## 11. Sample social drafts (to show the shape)

**LinkedIn (article launch):**
> Two years ago a single NIC install took my entire Proxmox cluster down — interface renaming quietly broke networking, corosync *and* ZFS auto-import at the same time.
>
> I've written up the full post-mortem: how I recovered it with `init=/bin/bash`, pinned interfaces with MAC-based systemd `.link` files, and stopped it ever happening again.
>
> If you run Proxmox at home or at work, this is the failure mode nobody warns you about. Link in comments. #homelab #proxmox #sysadmin

**Instagram carousel (caption):**
> I broke my home server cluster. Here's how I got it back. 🧵➡️
> Swipe for the 5-step recovery. Full write-up on richhacks.blog (link in bio).
> #homelab #selfhosted #proxmox #sysadmin #cybersecurity #zfs #linux

**Vertical video hook (first 3 seconds — the make-or-break):**
> "I installed one network card and it took my entire server cluster offline. Three things broke at once — here's the fix." *(then: 4 fast cuts of the terminal recovery, end on the working dashboard + "full guide on richhacks.blog")*

---

*I can turn any of these into a full 4-week social content calendar with a post for each launch article whenever you want it.*

