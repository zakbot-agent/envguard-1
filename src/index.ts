#!/usr/bin/env node

import * as path from "path";
import { parseEnvFile } from "./parser";
import { compare } from "./comparator";
import { formatTable, formatJSON, formatCI } from "./formatter";
import { generateExample } from "./init";
import { formatEnvFile } from "./format-env";

// ── Arg parsing (zero deps) ──────────────────────────────────────

interface CLIArgs {
  envPath: string;
  examplePath: string;
  init: boolean;
  strict: boolean;
  format: boolean;
  json: boolean;
  ci: boolean;
  help: boolean;
}

function parseArgs(argv: string[]): CLIArgs {
  const args = argv.slice(2);

  const flags: CLIArgs = {
    envPath: ".env",
    examplePath: ".env.example",
    init: false,
    strict: false,
    format: false,
    json: false,
    ci: false,
    help: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case "--env":
        flags.envPath = args[++i] || flags.envPath;
        break;
      case "--example":
        flags.examplePath = args[++i] || flags.examplePath;
        break;
      case "--init":
        flags.init = true;
        break;
      case "--strict":
        flags.strict = true;
        break;
      case "--format":
        flags.format = true;
        break;
      case "--json":
        flags.json = true;
        break;
      case "--ci":
        flags.ci = true;
        break;
      case "--help":
      case "-h":
        flags.help = true;
        break;
      default:
        console.error(`Unknown flag: ${arg}`);
        process.exit(1);
    }
  }

  return flags;
}

// ── Help ─────────────────────────────────────────────────────────

function printHelp(): void {
  const help = `
envguard — Validate .env files against .env.example

Usage:
  envguard                              Compare .env with .env.example
  envguard --env <path> --example <p>   Custom file paths
  envguard --init                       Generate .env.example from .env
  envguard --strict                     Fail on extra variables too
  envguard --format                     Sort .env alphabetically
  envguard --json                       Output as JSON
  envguard --ci                         Minimal output (CI-friendly)
  envguard --help                       Show this help

Exit codes:
  0   All required variables present
  1   Missing variables detected (or extra in --strict mode)
`;
  console.log(help.trim());
}

// ── Main ─────────────────────────────────────────────────────────

function main(): void {
  const flags = parseArgs(process.argv);

  if (flags.help) {
    printHelp();
    process.exit(0);
  }

  // --init: generate .env.example from .env
  if (flags.init) {
    try {
      const { created, variableCount } = generateExample(
        flags.envPath,
        flags.examplePath
      );
      console.log(
        `Created ${path.basename(created)} with ${variableCount} variable(s) from ${path.basename(flags.envPath)}`
      );
      process.exit(0);
    } catch (err: any) {
      console.error(`Error: ${err.message}`);
      process.exit(1);
    }
  }

  // --format: sort .env alphabetically
  if (flags.format) {
    try {
      const { sorted } = formatEnvFile(flags.envPath);
      console.log(`Sorted ${sorted} variable(s) in ${path.basename(flags.envPath)}`);
      process.exit(0);
    } catch (err: any) {
      console.error(`Error: ${err.message}`);
      process.exit(1);
    }
  }

  // Default: compare .env vs .env.example
  try {
    const envEntries = parseEnvFile(flags.envPath).entries;
    const exampleEntries = parseEnvFile(flags.examplePath).entries;
    const result = compare(envEntries, exampleEntries);

    // Output
    if (flags.json) {
      console.log(formatJSON(result));
    } else if (flags.ci) {
      console.log(formatCI(result));
    } else {
      console.log(formatTable(result));
    }

    // Exit code
    if (result.hasMissing) {
      process.exit(1);
    }
    if (flags.strict && result.hasExtra) {
      process.exit(1);
    }

    process.exit(0);
  } catch (err: any) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

main();
