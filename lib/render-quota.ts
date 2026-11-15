/**
 * LUMENS - render credit store
 * ----------------------------
 * Tracks the free image renders granted to every registered account. Text
 * phases (1, 2, 4, 5) are unlimited; only the image rendering phase consumes
 * credits, so the whole quota lives in this small server-only module.
 *
 * Storage mirrors `lib/user-store.ts`:
 *  - JSON file in `.data/render-credits.json` (git-ignored, `LUMENS_DATA_DIR`),
 *  - in-process write queue + atomic temp-file rename,
 *  - development store: a serverless deployment needs a real database.
 *
 * Credits are consumed **before** the upstream call and refunded when the
 * provider fails, so two parallel requests can never overspend the quota.
 */

import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";

/** Default number of free test renders per registered user. */
export const DEFAULT_FREE_RENDER_CREDITS = 3;

/** Env override: `RENDER_FREE_CREDITS=3` (0 disables free renders). */
export function freeRenderLimit(): number {
  const raw = Number.parseInt(process.env.RENDER_FREE_CREDITS ?? "", 10);
  return Number.isFinite(raw) && raw >= 0 ? raw : DEFAULT_FREE_RENDER_CREDITS;
}

export const FREE_RENDER_LIMIT = freeRenderLimit();

export interface RenderQuota {
  userId: string;
  limit: number;
  used: number;
  remaining: number;
  updatedAt: string | null;
}

export interface CreditConsumption {
  ok: boolean;
  quota: RenderQuota;
}

interface CreditRecord {
  userId: string;
  used: number;
  updatedAt: string;
}

const dataDir = process.env.LUMENS_DATA_DIR ?? path.join(process.cwd(), ".data");
const creditsFile = path.join(dataDir, "render-credits.json");

/** Serialises read-modify-write cycles inside this process. */
let writeQueue: Promise<unknown> = Promise.resolve();

function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const run = writeQueue.then(task, task);
  writeQueue = run.catch(() => undefined);
  return run;
}

function toQuota(userId: string, record: CreditRecord | null): RenderQuota {
  const limit = freeRenderLimit();
  const used = Math.max(0, record?.used ?? 0);
  return {
    userId,
    limit,
    used,
    remaining: Math.max(0, limit - used),
    updatedAt: record?.updatedAt ?? null,
  };
}

function isCreditRecord(value: unknown): value is CreditRecord {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.userId === "string" &&
    typeof candidate.used === "number" &&
    Number.isFinite(candidate.used) &&
    typeof candidate.updatedAt === "string"
  );
}

async function readRecords(): Promise<CreditRecord[]> {
  try {
    // Strip a UTF-8 BOM so hand-edited files still parse.
    const raw = (await fs.readFile(creditsFile, "utf8")).replace(/^\uFEFF/, "");
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isCreditRecord) : [];
  } catch (error) {
    if ((error as NodeJS.ErrnoException)?.code === "ENOENT") {
      return [];
    }

    console.error("[render-quota] failed to read credits file", error);
    throw new Error("render-quota-unavailable");
  }
}

async function writeRecords(records: CreditRecord[]): Promise<void> {
  await fs.mkdir(dataDir, { recursive: true });

  // Write to a temp file first so a crash never truncates the quota file.
  const tempFile = `${creditsFile}.${process.pid}.tmp`;
  await fs.writeFile(tempFile, `${JSON.stringify(records, null, 2)}\n`, "utf8");
  await fs.rename(tempFile, creditsFile);
}

/** Reads the current quota of a user without mutating it. */
export async function getRenderQuota(userId: string): Promise<RenderQuota> {
  const records = await readRecords();
  const record = records.find((entry) => entry.userId === userId) ?? null;
  return toQuota(userId, record);
}

/**
 * Reserves one render credit. Returns `ok: false` (and the unchanged quota)
 * when the account has no credits left.
 */
export function consumeRenderCredit(userId: string): Promise<CreditConsumption> {
  return enqueue(async () => {
    const records = await readRecords();
    const index = records.findIndex((entry) => entry.userId === userId);
    const current = index >= 0 ? records[index] : null;
    const quota = toQuota(userId, current);

    if (quota.remaining <= 0) {
      return { ok: false, quota };
    }

    const next: CreditRecord = {
      userId,
      used: quota.used + 1,
      updatedAt: new Date().toISOString(),
    };

    if (index >= 0) records[index] = next;
    else records.push(next);

    await writeRecords(records);
    return { ok: true, quota: toQuota(userId, next) };
  });
}

/**
 * Gives one credit back after a failed upstream call (timeout, 429, bad key).
 * Never lets `used` drop below zero.
 */
export function refundRenderCredit(userId: string): Promise<RenderQuota> {
  return enqueue(async () => {
    const records = await readRecords();
    const index = records.findIndex((entry) => entry.userId === userId);

    if (index < 0) {
      return toQuota(userId, null);
    }

    const current = records[index];
    const next: CreditRecord = {
      userId,
      used: Math.max(0, current.used - 1),
      updatedAt: new Date().toISOString(),
    };

    records[index] = next;
    await writeRecords(records);
    return toQuota(userId, next);
  });
}
