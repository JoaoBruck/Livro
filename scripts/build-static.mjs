import { rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const result = spawnSync(process.execPath, [require.resolve("next/dist/bin/next"), "build", "--webpack"], {
  stdio: "inherit",
  env: {
    ...process.env,
    NEXT_TELEMETRY_DISABLED: "1",
    NEXT_PUBLIC_BASE_PATH: process.env.NEXT_PUBLIC_BASE_PATH ?? "/Livro",
  },
});
if (result.error) throw result.error;
// A reserved, unreleased route must produce the host’s real 404.
if (result.status === 0) rmSync(new URL("../out/outro-lado", import.meta.url), { recursive: true, force: true });
process.exit(result.status ?? 1);
