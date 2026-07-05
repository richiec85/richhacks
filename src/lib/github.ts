// Reads GITHUB_USERS (comma-separated) and GITHUB_TOKEN from env, at build time.
// Merges public (and, if the token has repo scope, private) repos across all accounts.
// Never throws — a GitHub outage or rate limit should never fail the site build.
//
// This module only ever runs server-side at build time (never bundled to the
// client), so it reads both import.meta.env and process.env and prefers
// whichever is actually set — CI platforms don't all surface dashboard-set
// env vars to Vite's import.meta.env the same way a local .env file does.
const rawUsers = import.meta.env.GITHUB_USERS ?? process.env.GITHUB_USERS ?? "";
const rawToken = import.meta.env.GITHUB_TOKEN ?? process.env.GITHUB_TOKEN;

console.log("[github.ts debug] import.meta.env.GITHUB_USERS:", import.meta.env.GITHUB_USERS);
console.log("[github.ts debug] process.env.GITHUB_USERS:", process.env.GITHUB_USERS);
console.log(
  "[github.ts debug] import.meta.env.GITHUB_TOKEN present:",
  !!import.meta.env.GITHUB_TOKEN,
);
console.log("[github.ts debug] process.env.GITHUB_TOKEN present:", !!process.env.GITHUB_TOKEN);

const USERS = rawUsers
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const TOKEN = rawToken;

console.log("[github.ts debug] resolved USERS:", USERS);
console.log("[github.ts debug] resolved TOKEN present:", !!TOKEN);

export type Repo = {
  name: string;
  description: string | null;
  language: string | null;
  stars: number;
  url: string;
  pushedAt: string;
  topics: string[];
  account: string;
};

export async function getProjects(): Promise<Repo[]> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (TOKEN) headers.Authorization = `Bearer ${TOKEN}`;

  const all: Repo[] = [];
  for (const user of USERS) {
    const url = `https://api.github.com/users/${user}/repos?per_page=100&sort=pushed`;
    console.log("[github.ts debug] requesting:", url);
    try {
      const res = await fetch(url, { headers });
      console.log("[github.ts debug]", user, "status:", res.status, res.statusText);
      if (!res.ok) {
        console.log("[github.ts debug]", user, "body:", await res.text());
        continue;
      }
      const repos = await res.json();
      console.log("[github.ts debug]", user, "repos returned:", repos.length);
      for (const r of repos) {
        if (r.fork || r.archived) continue;
        all.push({
          name: r.name,
          description: r.description,
          language: r.language,
          stars: r.stargazers_count,
          url: r.html_url,
          pushedAt: r.pushed_at,
          topics: r.topics ?? [],
          account: user,
        });
      }
    } catch (err) {
      console.log("[github.ts debug]", user, "fetch threw:", err);
      /* fall through - never fail the build on GitHub */
    }
  }
  console.log("[github.ts debug] total repos before dedupe:", all.length);
  // Sort most-recently-worked-on first; de-dupe by name+account.
  const seen = new Set<string>();
  const result = all
    .filter((r) =>
      seen.has(r.account + "/" + r.name) ? false : seen.add(r.account + "/" + r.name),
    )
    .sort((a, b) => +new Date(b.pushedAt) - +new Date(a.pushedAt));
  console.log("[github.ts debug] final result count:", result.length);
  return result;
}
