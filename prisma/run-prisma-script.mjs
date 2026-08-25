import { spawnSync } from "node:child_process";
import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, extname, join, relative, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const entrypoint = process.argv[2];

if (!entrypoint) {
  console.error("Usage: node prisma/run-prisma-script.mjs <script.ts>");
  process.exit(1);
}

const rootDir = process.cwd();
const outputDir = resolve(
  rootDir,
  ".tmp",
  "prisma-script-run",
  `${entrypoint.replace(/[^a-zA-Z0-9_-]/g, "-")}-${process.pid}`,
);
const compiledEntrypoint = resolve(outputDir, entrypoint.replace(/\.ts$/, ".js"));
const tscBin = resolve(
  rootDir,
  "node_modules",
  "typescript",
  "bin",
  "tsc",
);

await rm(outputDir, { recursive: true, force: true });
await mkdir(dirname(compiledEntrypoint), { recursive: true });

const compile = spawnSync(
  process.execPath,
  [
    tscBin,
    "--ignoreConfig",
    entrypoint,
    "--outDir",
    relative(rootDir, outputDir),
    "--module",
    "ES2022",
    "--target",
    "ES2022",
    "--moduleResolution",
    "bundler",
    "--esModuleInterop",
    "--skipLibCheck",
    "--noEmit",
    "false",
    "--rootDir",
    ".",
  ],
  { cwd: rootDir, stdio: "inherit" },
);

if (compile.status !== 0) {
  if (compile.error) {
    console.error(compile.error);
  }

  process.exit(compile.status ?? 1);
}

await writeFile(join(outputDir, "package.json"), '{"type":"module"}\n');
await rewriteRelativeImports(outputDir);
await import(pathToFileURL(compiledEntrypoint).href);

async function rewriteRelativeImports(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const entryPath = join(directory, entry.name);

    if (entry.isDirectory()) {
      await rewriteRelativeImports(entryPath);
      continue;
    }

    if (!entry.isFile() || extname(entry.name) !== ".js") {
      continue;
    }

    const source = await readFile(entryPath, "utf8");
    const rewritten = source.replace(
      /\b(from\s*["']|import\s*\(\s*["'])(\.{1,2}\/[^"']+)(["'])/g,
      (match, prefix, specifier, suffix) => {
        if (specifier.endsWith(".js") || specifier.endsWith(".json") || extname(specifier)) {
          return match;
        }

        return `${prefix}${specifier}.js${suffix}`;
      },
    );

    if (rewritten !== source) {
      await writeFile(entryPath, rewritten);
    }
  }
}
