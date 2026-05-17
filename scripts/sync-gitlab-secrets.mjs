import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const defaultSecretsPath = path.join(repoRoot, ".env.secrets");

const PUBLIC_VARIABLES = new Set([
  "SITE_URL",
  "VITE_CONVEX_URL",
  "VITE_CONVEX_SITE_URL",
  "AUTH_TRUSTED_ORIGINS",
  "BREVO_APP_NAME",
  "BREVO_SENDER_EMAIL",
  "BREVO_SENDER_NAME",
  "BREVO_REPLY_TO_EMAIL",
  "BREVO_REPLY_TO_NAME",
  "R2_ENDPOINT",
  "R2_BUCKET",
  "R2_PUBLIC_BASE_URL",
  "POLAR_SERVER",
]);

function parseArgs(argv) {
  const options = {
    envFile: defaultSecretsPath,
    repo: undefined,
    scope: "*",
    protected: false,
    hidden: false,
    dryRun: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = () => {
      const value = argv[index + 1];
      if (!value || value.startsWith("--")) {
        throw new Error(`Missing value for ${arg}`);
      }
      index += 1;
      return value;
    };

    if (arg === "--env-file") options.envFile = path.resolve(repoRoot, next());
    else if (arg === "--repo" || arg === "-R") options.repo = next();
    else if (arg === "--scope" || arg === "-s") options.scope = next();
    else if (arg === "--protected") options.protected = true;
    else if (arg === "--hidden") options.hidden = true;
    else if (arg === "--dry-run") options.dryRun = true;
    else if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
}

function printHelp() {
  console.log(`Usage: node scripts/sync-gitlab-secrets.mjs [options]

Uploads variables from .env.secrets to GitLab CI/CD variables using the authenticated glab session.

Options:
  --env-file <path>   Env file to read. Default: .env.secrets
  -R, --repo <repo>   GitLab repository for glab, e.g. owner/group/project
  -s, --scope <env>   GitLab environment scope. Default: *
  --protected         Mark variables as protected
  --hidden            Mark masked variables as hidden, if supported by your GitLab instance
  --dry-run           Print variable names that would be uploaded
  -h, --help          Show this help
`);
}

function runGlab(args, options = {}) {
  return spawnSync("glab", args, {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: options.stdio ?? ["ignore", "pipe", "pipe"],
  });
}

function ensureGlabAuthenticated() {
  const result = runGlab(["auth", "status"], { stdio: "ignore" });
  if (result.status !== 0) {
    console.error("ERROR: glab is not authenticated for API use.");
    console.error("Run `glab auth login` or fix `glab auth status` before syncing variables.");
    process.exit(result.status ?? 1);
  }
}

function loadVariables(envFile) {
  if (!fs.existsSync(envFile)) {
    console.error(`ERROR: env file not found: ${path.relative(repoRoot, envFile)}`);
    process.exit(1);
  }

  return Object.entries(dotenv.parse(fs.readFileSync(envFile))).filter(
    ([, value]) => value !== undefined && value !== "",
  );
}

function variableArgs([key, value], options) {
  const args = ["variable", "set", key, "--value", value, "--scope", options.scope, "--raw"];

  if (options.repo) {
    args.push("--repo", options.repo);
  }

  if (options.protected) {
    args.push("--protected");
  }

  if (!PUBLIC_VARIABLES.has(key)) {
    args.push("--masked");
    if (options.hidden) {
      args.push("--hidden");
    }
  }

  return args;
}

function syncVariables(variables, options) {
  console.log(
    `Syncing ${variables.length} GitLab CI/CD variables from ${path.relative(
      repoRoot,
      options.envFile,
    )}`,
  );

  if (options.protected) {
    console.log("Variables will be marked protected.");
  }

  for (const variable of variables) {
    const [key] = variable;
    const masked = !PUBLIC_VARIABLES.has(key);
    const visibility = masked ? (options.hidden ? "hidden masked" : "masked") : "visible";

    if (options.dryRun) {
      console.log(`  - ${key} (${visibility})`);
      continue;
    }

    process.stdout.write(`  - ${key} (${visibility})... `);
    const result = runGlab(variableArgs(variable, options));
    if (result.status !== 0) {
      process.stdout.write("failed\n");
      const message = (result.stderr || result.stdout || "Unknown glab error").trim();
      console.error(message);
      process.exit(result.status ?? 1);
    }
    process.stdout.write("ok\n");
  }
}

try {
  const options = parseArgs(process.argv.slice(2));
  const variables = loadVariables(options.envFile);

  if (variables.length === 0) {
    console.log("No variables found to sync.");
    process.exit(0);
  }

  if (!options.dryRun) {
    ensureGlabAuthenticated();
  }

  syncVariables(variables, options);
} catch (error) {
  console.error(`ERROR: ${error.message}`);
  process.exit(1);
}
