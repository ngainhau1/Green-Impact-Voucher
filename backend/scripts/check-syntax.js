import { readdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join } from "node:path";

const roots = ["src", "test"];
const files = [];

function collect(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      collect(path);
    } else if (entry.isFile() && path.endsWith(".js")) {
      files.push(path);
    }
  }
}

for (const root of roots) {
  collect(root);
}

for (const file of files) {
  const result = spawnSync(process.execPath, ["--check", file], { stdio: "inherit" });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

console.log(`Syntax check passed for ${files.length} files.`);
