import { EnvEntry } from "./parser";

export type VarStatus = "present" | "missing" | "extra";

export interface ComparisonEntry {
  key: string;
  status: VarStatus;
  envValue?: string;
  defaultValue?: string;
}

export interface ComparisonResult {
  entries: ComparisonEntry[];
  hasMissing: boolean;
  hasExtra: boolean;
  missingCount: number;
  extraCount: number;
  presentCount: number;
}

/**
 * Compare env entries against example entries.
 * Identifies missing, extra, and present variables.
 */
export function compare(
  envEntries: EnvEntry[],
  exampleEntries: EnvEntry[]
): ComparisonResult {
  const envMap = new Map<string, string>();
  for (const entry of envEntries) {
    envMap.set(entry.key, entry.value);
  }

  const exampleMap = new Map<string, string>();
  for (const entry of exampleEntries) {
    exampleMap.set(entry.key, entry.value);
  }

  const result: ComparisonEntry[] = [];
  const seenKeys = new Set<string>();

  // Check all keys from example
  for (const [key, defaultValue] of exampleMap) {
    seenKeys.add(key);

    if (envMap.has(key)) {
      result.push({
        key,
        status: "present",
        envValue: envMap.get(key),
        defaultValue,
      });
    } else {
      result.push({
        key,
        status: "missing",
        defaultValue,
      });
    }
  }

  // Find extra keys in env that are not in example
  for (const [key, value] of envMap) {
    if (!seenKeys.has(key)) {
      result.push({
        key,
        status: "extra",
        envValue: value,
      });
    }
  }

  // Sort: missing first, then present, then extra
  const statusOrder: Record<VarStatus, number> = {
    missing: 0,
    present: 1,
    extra: 2,
  };
  result.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);

  const missingCount = result.filter((e) => e.status === "missing").length;
  const extraCount = result.filter((e) => e.status === "extra").length;
  const presentCount = result.filter((e) => e.status === "present").length;

  return {
    entries: result,
    hasMissing: missingCount > 0,
    hasExtra: extraCount > 0,
    missingCount,
    extraCount,
    presentCount,
  };
}
