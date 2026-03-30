import * as fs from "fs";
import * as path from "path";

export interface EnvEntry {
  key: string;
  value: string;
  comment?: string;
}

export interface ParseResult {
  entries: EnvEntry[];
  comments: string[];
}

/**
 * Parse a .env file into structured entries.
 * Handles comments, empty lines, quoted values, and empty values.
 */
export function parseEnvFile(filePath: string): ParseResult {
  const absolutePath = path.resolve(filePath);

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`File not found: ${absolutePath}`);
  }

  const content = fs.readFileSync(absolutePath, "utf-8");
  return parseEnvContent(content);
}

/**
 * Parse raw .env content string into structured entries.
 */
export function parseEnvContent(content: string): ParseResult {
  const entries: EnvEntry[] = [];
  const comments: string[] = [];
  const lines = content.split(/\r?\n/);

  for (const rawLine of lines) {
    const line = rawLine.trim();

    // Skip empty lines
    if (line === "") continue;

    // Collect comments
    if (line.startsWith("#")) {
      comments.push(line);
      continue;
    }

    const entry = parseLine(line);
    if (entry) {
      entries.push(entry);
    }
  }

  return { entries, comments };
}

/**
 * Parse a single KEY=VALUE line, handling quotes and inline comments.
 */
function parseLine(line: string): EnvEntry | null {
  const eqIndex = line.indexOf("=");
  if (eqIndex === -1) return null;

  const key = line.substring(0, eqIndex).trim();
  if (!key) return null;

  let value = line.substring(eqIndex + 1).trim();

  // Handle quoted values
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }

  return { key, value };
}

/**
 * Convert entries back to .env file content.
 */
export function entriesToContent(entries: EnvEntry[]): string {
  return entries.map((e) => `${e.key}=${e.value}`).join("\n") + "\n";
}
