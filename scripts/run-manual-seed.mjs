import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const csvArg = process.argv[2] ?? "scripts/manual-project-seed.example.csv";
const csvPath = path.join(process.cwd(), csvArg);
const csv = fs.readFileSync(csvPath, "utf8").trim();
const lines = csv.split(/\r?\n/);
const headers = parseCsvLine(lines.shift());

const projects = lines.filter(Boolean).map((line) => {
  const cols = parseCsvLine(line);
  const row = Object.fromEntries(headers.map((header, index) => [header, cols[index] ?? ""]));

  return {
    url: row.url,
    title: row.title,
    description: row.description,
    type: row.type,
    ...(row.categorySlug ? { categorySlug: row.categorySlug } : {}),
  };
});

const args = JSON.stringify({ projects });
const result = spawnSync(
  "npx",
  [
    "convex",
    "run",
    "--deployment",
    "neat-peacock-424",
    "--typecheck",
    "disable",
    "--codegen",
    "disable",
    "projectSeed:seedProjectsFromRemote",
    args,
  ],
  {
    cwd: path.join(process.cwd(), "packages", "backend"),
    stdio: "inherit",
    env: {
      ...process.env,
      CONVEX_TMPDIR: path.join(process.cwd(), "packages", "backend", ".convex-tmp"),
    },
  },
);

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

function parseCsvLine(line) {
  const values = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];

    if (char === '"') {
      if (inQuotes && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      values.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current);
  return values;
}
