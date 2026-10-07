/**
 * Bundles scripts/cta-tone-check.cjs (the app is TSX, so it needs a build
 * step) and runs it. Invoked by `npm test`.
 */
import { build } from "esbuild";
import { spawnSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const outfile = path.join(root, "node_modules", ".cache", "cta-tone-check.bundle.cjs");
mkdirSync(path.dirname(outfile), { recursive: true });

await build({
  absWorkingDir: root,
  entryPoints: [path.join(root, "scripts", "cta-tone-check.cjs")],
  bundle: true,
  platform: "node",
  format: "cjs",
  outfile,
  // Resolved at runtime so the harness and the app share one jsdom instance.
  external: ["jsdom"],
  jsx: "automatic",
  alias: { "@": "./src" },
  logLevel: "warning",
});

const result = spawnSync(process.execPath, [outfile], { stdio: "inherit" });
process.exit(result.status ?? 1);
