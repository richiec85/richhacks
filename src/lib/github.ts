// Reads GITHUB_USERS (comma-separated) and GITHUB_TOKEN from env, at build time.
// Merges public (and, if the token has repo scope, private) repos across all accounts.
// Never throws — a GitHub outage or rate limit should never fail the site build.

const USERS = (import.meta.env.GITHUB_USERS ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const TOKEN = import.meta.env.GITHUB_TOKEN;

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
    try {
      const res = await fetch(
        `https://api.github.com/users/${user}/repos?per_page=100&sort=pushed`,
        { headers },
      );
      if (!res.ok) continue;
      const repos = await res.json();
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
    } catch {
      /* fall through - never fail the build on GitHub */
    }
  }
  // Sort most-recently-worked-on first; de-dupe by name+account.
  const seen = new Set<string>();
  return all
    .filter((r) =>
      seen.has(r.account + "/" + r.name) ? false : seen.add(r.account + "/" + r.name),
    )
    .sort((a, b) => +new Date(b.pushedAt) - +new Date(a.pushedAt));
}
