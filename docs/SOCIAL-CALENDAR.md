# RichHacks — 4-Week Social Launch Calendar

Ready-to-post copy for the first three articles, mapped week by week. **Nothing here is bespoke-for-social** — every item repurposes a blog post, which is the only sustainable way to do this alongside everything else. Budget ~20 minutes of social time per post.

**Channels, in priority order for your audience:**
1. **LinkedIn** — your main channel (the MSc-Distinction audience is exactly right).
2. **Reddit** — where technical war-stories actually spread. Contribute as a person, not a marketer.
3. **Hacker News** — one front-page hit outweighs months of everything else.
4. **X / Mastodon / Bluesky** — the infosec + homelab community.
5. **Instagram / TikTok / YouTube Shorts** — repurpose-only, from Week 2 onward.

**Reminder on what's automated:** none of it. I draft; you (or a scheduler like Buffer / Metricool — both have free tiers) post. These platforms rank on hooks, captions, hashtags and timing, not backlinks — so that's what these drafts optimise.

**Best posting times (UK/IE):** LinkedIn Tue–Thu 08:00–10:00 or 12:00–13:00. Reddit/HN weekday mornings US-eastern overlap (≈14:00–16:00 UK). Instagram/short-form evenings 18:00–21:00.

---

## Week 1 — Launch: the Proxmox post-mortem

**Goal:** ship the blog, make the first post land where homelab people actually are.

### LinkedIn (primary — post launch day, Tue–Thu AM)
> Two years of running a home Proxmox cluster, and one routine hardware swap still caught me out.
>
> I shut a node down, added a network card, powered it back on — and it came up with no network, no cluster quorum, and no storage. Three subsystems down from one change, each failure hiding the next.
>
> I've written up the full post-mortem: the PCI-reenumeration root cause, how I recovered from an initramfs shell, and the two-minute systemd `.link` fix that means interface names can never drift again.
>
> If you run Proxmox — at home or at work — this is the failure mode nobody warns you about.
>
> 👉 richhacks.blog *(first post on the new blog — more homelab, security and AI war-stories to come)*
>
> #homelab #proxmox #linux #sysadmin #zfs #cybersecurity

### Reddit (day 1–2, post *natively* — don't just drop a link)
- **r/homelab** and **r/Proxmox** — best fit. Title: *"One NIC install took down networking, corosync AND ZFS on my 2-node cluster — full post-mortem + the permanent fix"*. Write a 3–4 sentence genuine summary in the body, then link. Reply to every comment.
- **r/selfhosted**, **r/sysadmin** — secondary, same day or day 2.
- Golden rule: give the whole lesson in the comments too. Redditors punish link-and-run; they reward people who actually answer.

### Hacker News (day 1, morning)
- Submit as **"Show HN"** is wrong here (it's a post, not a product) — submit as a normal link. Title exactly as the article: *"How One NIC Took Down My Entire Proxmox Cluster"*.
- Add one first comment with the 30-second version so people engage even if it doesn't front-page.

### X / Mastodon / Bluesky (day 1)
> Added one network card to my Proxmox node. It came back with no network, no quorum, no storage.
>
> PCI re-enumeration renamed the interface → config pointed at a ghost → corosync lost the ring → stale ZFS cache stopped the boot.
>
> Full post-mortem + the systemd .link fix so it never drifts again 👇
> richhacks.blog

*(Mastodon: add #homelab #proxmox. Bluesky: same. Keep it one post; thread the recovery steps underneath if it gets traction.)*

---

## Week 2 — Post 2: Zero Trust for a small MSP (Part 1) + first repurpose

**Goal:** publish your differentiator; start repurposing Week 1 into visual formats.

### LinkedIn (launch day)
> "Zero Trust" has been so thoroughly marketed that it's almost lost meaning. So I spent an MSc dissertation pulling it apart — specifically what it actually means for a *small* MSP running multi-tenant infrastructure, not a Fortune 500.
>
> Part 1 of a practical series, translated out of academic language into what you'd actually implement on Monday morning.
>
> No products pitched. Just the architecture, the ISMS fit, and where the real friction is.
>
> 👉 richhacks.blog
>
> #zerotrust #cybersecurity #MSP #NIS2 #ISO27001 #infosec

### Reddit
- **r/msp** (perfect fit), **r/cybersecurity**, **r/sysadmin**. Title angle: *"What Zero Trust actually means for a small MSP — a practitioner's breakdown, minus the vendor pitch"*. The "minus the vendor pitch" framing does well in r/msp.

### Instagram / TikTok / Shorts — REPURPOSE Week 1 (your first video, ~20 min to make)
**45–60s vertical video. Hook is everything — first 3 seconds:**
> *(on camera or screen-record of the terminal)* "I installed one network card and it took my entire home server cluster offline. Three things broke at once. Here's the fix."
>
> Then 4 fast cuts: `ip -br link` showing the renamed interface → the `.link` file → `ifreload -a` → the green dashboard. End card: **"full guide → richhacks.blog"**.

**Instagram carousel (5 slides, from the same post):**
1. "I broke my home server cluster with ONE network card 🧵"
2. "What happened: added a NIC → the OS renamed my network interface"
3. "The cascade: no network → no cluster quorum → storage wouldn't mount"
4. "The fix: pin the interface name to its MAC with a systemd .link file"
5. "Full write-up on richhacks.blog (link in bio) 🔗"
> Caption: *One card. Three failures. Here's the post-mortem and the two-minute fix so it never happens again. Full guide on the blog — link in bio.*
> #homelab #selfhosted #proxmox #sysadmin #cybersecurity #zfs #linux #homelabsetup

---

## Week 3 — Post 3: Running a local LLM + RAG on your own hardware

**Goal:** hit the AI × security intersection; the highest-interest topic for readers *and* sponsors.

### LinkedIn (launch day)
> Everyone's sending their data to someone else's AI. I built mine to run entirely on hardware I own — a local LLM with a private RAG knowledge base, no data leaving the house.
>
> Here's the full setup: the model, the retrieval pipeline, the hardware, and the honest trade-offs vs. just paying for a frontier API.
>
> Genuinely useful if you care about keeping sensitive data in-house — which, if you're in security, you do.
>
> 👉 richhacks.blog
>
> #AI #LLM #RAG #cybersecurity #privacy #homelab #selfhosted

### Reddit
- **r/LocalLLaMA** (very active, perfect fit), **r/selfhosted**, **r/homelab**. r/LocalLLaMA rewards real benchmarks and specifics — lead with your hardware and tokens/sec, not the concept.

### Short-form video — REPURPOSE Post 2 or 3
> Hook: "Everyone's putting their company data into ChatGPT. I run my AI entirely on my own hardware — here's how." → quick screen tour of the local setup → end card to blog.

---

## Week 4 — Consolidate, engage, and set the rhythm

**Goal:** no new heavy post required — this is a breather week that keeps momentum without burning you out.

- **LinkedIn "lessons" post** (no new article needed):
  > Three weeks of writing up what I've learned running a homelab and doing security work. The recurring theme across every post so far: the failure you didn't prepare for is always the one that gets you. A few of the biggest lessons 👇 *(3 short bullets pulled from posts 1–3, each linking back).*
- **Repurpose** the strongest Week 1–3 post into a second short video.
- **Reddit:** answer questions in your niche subs *without* linking — pure goodwill. It compounds. When people click your profile and find the blog, that's worth more than any drop-link.
- **Review analytics:** which post drove the most traffic? Which channel? Double down there next month and quietly drop whatever returned nothing.
- **Set the ongoing cadence:** one post every 1–2 weeks, each with a LinkedIn post + one Reddit share + (optional) a repurposed short. Keep 2–3 drafts in the pipeline so a busy fortnight never breaks the streak.

---

## Hashtag banks (reuse per pillar)

- **Homelab:** #homelab #selfhosted #proxmox #linux #sysadmin #zfs #homelabsetup #homeserver
- **Security:** #cybersecurity #infosec #zerotrust #NIS2 #ISO27001 #MSP #GRC #networksecurity
- **AI:** #AI #LLM #RAG #LocalLLaMA #privacy #selfhosted #machinelearning

## Guardrails (same as the main plan)
- Anonymise/generalise anything client- or work-related. Your homelab `10.10.10.x` is fine; client environments never appear.
- Label anything sponsored or affiliate (`#ad`, "contains affiliate links") — UK/NI ASA rules.
- If Qualcom advertises, a clearly-labelled placement is fine and a genuine early win — just keep it obviously marked.

---

*Want me to draft Week 5–8 once you see which channel performs, or write the actual video scripts (shot-by-shot) for the first two shorts?*

