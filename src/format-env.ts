import * as fs from "fs";
import * as path from "path";
import { parseEnvFile, entriesToContent } from "./parser";

/**
 * Sort and group .env variables alphabetically, rewriting the file in place.
 */
export function formatEnvFile(envPath: string): { sorted: number } {
  const absolutePath = path.resolve(envPath);

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`File not found: ${absolutePath}`);
  }

  const { entries } = parseEnvFile(absolutePath);

  // Sort alphabetically by key
  const sorted = [...entries].sort((a, b) =>
    a.key.localeCompare(b.key, undefined, { sensitivity: "base" })
  );

  // Group by first letter prefix
  const lines: string[] = [];
  let lastPrefix = "";

  for (const entry of sorted) {
    const prefix = entry.key.split("_")[0] || entry.key[0];
    if (lastPrefix && prefix !== lastPrefix) {
      lines.push(""); // blank line between groups
    }
    lastPrefix = prefix;
    lines.push(`${entry.key}=${entry.value}`);
  }

  lines.push(""); // trailing newline
  fs.writeFileSync(absolutePath, lines.join("\n"), "utf-8");

  return { sorted: entries.length };
}
