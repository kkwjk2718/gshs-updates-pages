import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputPath = path.resolve(__dirname, "..", "src", "data", "releases.json");

const response = await fetch("https://api.github.com/repos/kkwjk2718/gshsapp/releases?per_page=20", {
  headers: {
    "User-Agent": "gshs-updates-pages/0.1",
    Accept: "application/vnd.github+json",
  },
});

if (!response.ok) {
  throw new Error(`Failed to fetch releases: ${response.status}`);
}

const payload = await response.json();
const releases = payload.map((release) => {
  const body = typeof release.body === "string" ? release.body.trim() : "";
  const lines = body
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const bullets = lines
    .filter((line) => line.startsWith("- ") || line.startsWith("* "))
    .map((line) => line.slice(2).trim())
    .filter(Boolean);

  return {
    tagName: release.tag_name,
    title: release.name || release.tag_name,
    publishedAt: release.published_at,
    htmlUrl: release.html_url,
    summary:
      body.length > 0
        ? body.replace(/\r?\n+/g, " ").slice(0, 180)
        : "운영 배포 성공 후 자동 생성된 릴리스입니다.",
    notes: bullets,
  };
});

await fs.mkdir(path.dirname(outputPath), { recursive: true });
await fs.writeFile(outputPath, `${JSON.stringify(releases, null, 2)}\n`, "utf8");
console.log(`Fetched ${releases.length} releases.`);
