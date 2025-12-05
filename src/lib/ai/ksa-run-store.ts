/* eslint-disable @typescript-eslint/no-explicit-any */
import { Redis } from "@upstash/redis";
import fs from "fs";
import path from "path";
import { promisify } from "util";

type RunStatus = "queued" | "running" | "completed" | "failed";

export type RunRecord = {
  status: RunStatus;
  output?: any;
  error?: string;
  startedAt?: number;
  finishedAt?: number;
};

const memory =
  (globalThis as any).__KSA_RUN_STORE ||
  ((globalThis as any).__KSA_RUN_STORE = new Map<string, RunRecord>());

// File-based fallback so Next app and Inngest worker can share state locally
const FILE_PATH =
  process.env.KSA_RUN_STORE_FILE || path.join("/tmp", "ksa-run-store.json");
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

let redis: Redis | null = null;
function getRedis() {
  if (redis !== null) return redis;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    redis = new Redis({ url, token });
  } else {
    redis = null;
  }
  return redis;
}

const key = (id: string) => `ksa:run:${id}`;

export async function setRunRecord(id: string, record: RunRecord) {
  const client = getRedis();
  memory.set(id, record);
  if (client) {
    try {
      await client.set(key(id), record);
    } catch (err) {
      console.error("Failed to persist run record to Redis", err);
    }
  }
  try {
    const all = await readAllFromFile();
    all[id] = record;
    await writeFile(FILE_PATH, JSON.stringify(all), "utf8");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    // swallow file write errors in serverless
    // console.error("Failed to persist run record to file", err);
  }
}

export async function getRunRecord(id: string): Promise<RunRecord | null> {
  const client = getRedis();
  if (client) {
    try {
      const rec = await client.get<RunRecord>(key(id));
      if (rec) return rec;
    } catch (err) {
      console.error("Failed to read run record from Redis", err);
    }
  }
  // File fallback
  try {
    const all = await readAllFromFile();
    if (all[id]) return all[id];
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    // ignore
  }
  return memory.get(id) || null;
}

async function readAllFromFile(): Promise<Record<string, RunRecord>> {
  try {
    const data = await readFile(FILE_PATH, "utf8");
    return JSON.parse(data || "{}");
  } catch {
    return {};
  }
}
