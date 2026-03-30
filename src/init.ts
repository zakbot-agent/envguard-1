import * as fs from "fs";
import * as path from "path";
import { parseEnvFile } from "./parser";

/**
 * Generate a .env.example from an existing .env file.
 * Strips all values but keeps keys and comments structure.
 */
export function generateExample(
  envPath: string,
  outputPath: string
): { created: string; variableCount: number } {
  const absoluteEnv = path.resolve(envPath);
  const absoluteOutput = path.resolve(outputPath);

  if (!fs.existsSync(absoluteEnv)) {
    throw new Error(`Source .env file not found: ${absoluteEnv}`);
  }

  const content = fs.readFileSync(absoluteEnv, "utf-8");
  const lines = content.split(/\r?\n/);
  const outputLines: string[] = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();

    // Preserve empty lines and comments as-is
    if (line === "" || line.startsWith("#")) {
      outputLines.push(rawLine);
      continue;
    }

    const eqIndex = line.indexOf("=");
    if (eqIndex === -1) {
      outputLines.push(rawLine);
      continue;
    }

    // Keep only the key, strip the value
    const key = line.substring(0, eqIndex).trim();
    outputLines.push(`${key}=`);
  }

  fs.writeFileSync(absoluteOutput, outputLines.join("\n"), "utf-8");

  const { entries } = parseEnvFile(absoluteEnv);
  return { created: absoluteOutput, variableCount: entries.length };
}
