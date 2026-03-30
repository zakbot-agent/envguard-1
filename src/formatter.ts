import { ComparisonResult, ComparisonEntry, VarStatus } from "./comparator";

// ANSI color codes — zero dependencies
const RESET = "\x1b[0m";
const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";

function colorize(text: string, color: string): string {
  return `${color}${text}${RESET}`;
}

const STATUS_DISPLAY: Record<VarStatus, { label: string; color: string }> = {
  present: { label: "OK", color: GREEN },
  missing: { label: "MISSING", color: RED },
  extra: { label: "EXTRA", color: YELLOW },
};

/**
 * Format comparison result as a colored table for terminal output.
 */
export function formatTable(result: ComparisonResult): string {
  const lines: string[] = [];

  // Calculate column widths
  const keyWidth = Math.max(
    8,
    ...result.entries.map((e) => e.key.length)
  );
  const statusWidth = 9;
  const defaultWidth = 15;

  // Header
  const header =
    `  ${"Variable".padEnd(keyWidth)}  ${"Status".padEnd(statusWidth)}  ${"Default".padEnd(defaultWidth)}`;
  lines.push("");
  lines.push(colorize(BOLD + header, BOLD));
  lines.push(DIM + "  " + "─".repeat(keyWidth + statusWidth + defaultWidth + 4) + RESET);

  // Rows
  for (const entry of result.entries) {
    const display = STATUS_DISPLAY[entry.status];
    const statusStr = colorize(display.label.padEnd(statusWidth), display.color);
    const defaultStr = entry.defaultValue ?? DIM + "—" + RESET;
    lines.push(
      `  ${entry.key.padEnd(keyWidth)}  ${statusStr}  ${defaultStr}`
    );
  }

  // Summary
  lines.push("");
  const parts: string[] = [];
  parts.push(colorize(`${result.presentCount} OK`, GREEN));
  if (result.missingCount > 0) {
    parts.push(colorize(`${result.missingCount} missing`, RED));
  }
  if (result.extraCount > 0) {
    parts.push(colorize(`${result.extraCount} extra`, YELLOW));
  }
  lines.push(`  ${parts.join("  |  ")}`);
  lines.push("");

  return lines.join("\n");
}

/**
 * Format comparison result as JSON.
 */
export function formatJSON(result: ComparisonResult): string {
  const output = {
    ok: !result.hasMissing,
    summary: {
      present: result.presentCount,
      missing: result.missingCount,
      extra: result.extraCount,
    },
    variables: result.entries.map((e) => ({
      key: e.key,
      status: e.status,
      ...(e.defaultValue !== undefined && { default: e.defaultValue }),
    })),
  };
  return JSON.stringify(output, null, 2);
}

/**
 * Format for CI mode — minimal output, only errors.
 */
export function formatCI(result: ComparisonResult): string {
  const lines: string[] = [];

  const missing = result.entries.filter((e) => e.status === "missing");
  if (missing.length > 0) {
    lines.push(`ERROR: ${missing.length} missing variable(s):`);
    for (const entry of missing) {
      lines.push(`  - ${entry.key}`);
    }
  }

  const extra = result.entries.filter((e) => e.status === "extra");
  if (extra.length > 0) {
    lines.push(`WARNING: ${extra.length} extra variable(s):`);
    for (const entry of extra) {
      lines.push(`  - ${entry.key}`);
    }
  }

  if (missing.length === 0 && extra.length === 0) {
    lines.push("OK: All variables present.");
  }

  return lines.join("\n");
}
