import { createHash } from "node:crypto";
import { readFile, readdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

// Astro's build inlines a couple of small scripts directly into every page
// (dark-mode-flash prevention, the theme toggle) rather than shipping them
// as external files. A strict CSP can still allow them without 'unsafe-inline'
// by allowlisting their exact SHA-256 hash — but that hash is only valid as
// long as the script's bytes don't change. Hand-maintaining it in
// public/_headers means editing either script silently breaks the site
// (CSP blocks it, no build error) until someone remembers to recompute the
// hash. This integration removes that failure mode entirely by computing the
// hashes from the actual build output and writing them into dist/_headers on
// every build, so they can never go stale.
const SCRIPT_TAG = /<script(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/gi;

async function findHtmlFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) return findHtmlFiles(full);
      return entry.name.endsWith(".html") ? [full] : [];
    }),
  );
  return files.flat();
}

export default function cspHeaders() {
  return {
    name: "csp-headers",
    hooks: {
      "astro:build:done": async ({ dir, logger }) => {
        const outDir = fileURLToPath(dir);
        const htmlFiles = await findHtmlFiles(outDir);
        const hashes = new Set();

        for (const file of htmlFiles) {
          const html = await readFile(file, "utf8");
          for (const [, attrs, content] of html.matchAll(SCRIPT_TAG)) {
            if (/type\s*=\s*["']application\/ld\+json["']/i.test(attrs)) continue;
            if (!content.trim()) continue;
            hashes.add(`'sha256-${createHash("sha256").update(content).digest("base64")}'`);
          }
        }

        const scriptSrc = `script-src 'self' ${[...hashes].sort().join(" ")}`;
        const csp = [
          "default-src 'self'",
          scriptSrc,
          "style-src 'self' 'unsafe-inline'",
          "img-src 'self'",
          "font-src 'self'",
          "connect-src 'self'",
          "object-src 'none'",
          "base-uri 'self'",
          "form-action 'self'",
          "frame-ancestors 'none'",
          "upgrade-insecure-requests",
        ].join("; ");

        const headersPath = path.join(outDir, "_headers");
        let headersContent;
        try {
          headersContent = await readFile(headersPath, "utf8");
        } catch {
          headersContent = "/*\n";
        }

        const cspLine = `  Content-Security-Policy: ${csp}`;
        headersContent = /^\s*Content-Security-Policy:/m.test(headersContent)
          ? headersContent.replace(/^\s*Content-Security-Policy:.*$/m, cspLine)
          : headersContent.replace(/^(\/\*\s*\n)/, `$1${cspLine}\n`);

        await writeFile(headersPath, headersContent, "utf8");
        logger.info(`Injected CSP with ${hashes.size} script hash(es) into _headers`);
      },
    },
  };
}
