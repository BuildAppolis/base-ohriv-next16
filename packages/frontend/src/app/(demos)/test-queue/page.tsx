"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { nanoid } from "nanoid";
import { useEffect, useRef, useState } from "react";

export default function TestQueuePage() {
  const [context, setContext] = useState<string>("");
  const [eventId, setEventId] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [rawResponse, setRawResponse] = useState<string>("");
  const [jobs, setJobs] = useState<SimJob[]>([]);

  // Load jobs from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setJobs(parsed);
        }
      }
    } catch (err) {
      console.error("Failed to parse stored jobs", err);
    }
  }, []);

  // Persist jobs to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(jobs));
    } catch (err) {
      console.error("Failed to persist jobs", err);
    }
  }, [jobs]);

  const handleSubmit = async () => {
    setError("");
    setRawResponse("");
    setStatus("Submitting...");
    setEventId("");
    try {
      const res = await fetch("/api/jobs/ksa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context }),
      });
      const text = await res.text();
      setRawResponse(text);

      let data: any = {};
      try {
        data = JSON.parse(text);
      } catch {
        // leave data empty; we captured raw text
      }

      if (!res.ok) {
        throw new Error(data?.error || text || "Failed to enqueue job");
      }

      setEventId(data.eventId || "");
      setStatus("Enqueued");

      // Also track in local simulated list with the returned eventId
      const trimmed = context.trim();
      if (trimmed && data.eventId) {
        const job: SimJob = {
          id: nanoid(),
          runId: data.eventId,
          context: trimmed,
          status: "queued",
          startedAt: null,
          finishedAt: null,
          durationMs: 0,
        };
        setJobs((prev) => [...prev, job]);
      }
    } catch (err: any) {
      setError(err.message || "Failed to enqueue job");
      setStatus("");
    }
  };

  const addJob = () => {
    const trimmed = context.trim();
    if (!trimmed) {
      setError("Provide context to enqueue a job");
      return;
    }
    const job: SimJob = {
      id: nanoid(),
      runId: undefined,
      context: trimmed,
      status: "queued",
      startedAt: null,
      finishedAt: null,
      durationMs: 0,
    };
    setJobs((prev) => [...prev, job]);
  };

  useSimulatedQueue(jobs, setJobs);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Test Queue (Inngest)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Company Context (stringified JSON)
            </label>
            <Textarea
              className="min-h-[200px]"
              placeholder='{"company_profile":{"name":"TechCorp Solutions"}}'
              value={context}
              onChange={(e) => setContext(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={handleSubmit}>Send to Queue</Button>
            <Button variant="secondary" onClick={addJob}>
              Add to Sim Queue
            </Button>
            {status && <span className="text-sm text-muted-foreground">{status}</span>}
            {error && <span className="text-sm text-red-500">{error}</span>}
          </div>
          {eventId && (
            <div className="space-y-2 rounded-md border p-3">
              <p className="text-sm font-semibold">Event ID</p>
              <Input readOnly value={eventId} />
              <p className="text-xs text-muted-foreground">
                Check this in the Inngest dev UI or your logs to verify execution.
              </p>
            </div>
          )}
          {rawResponse && (
            <div className="space-y-2 rounded-md border p-3">
              <p className="text-sm font-semibold">Raw response</p>
              <Textarea readOnly className="min-h-[120px]" value={rawResponse} />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Simulated Queue (local only)</CardTitle>
            {jobs.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setJobs([]);
                  localStorage.removeItem(LS_KEY);
                }}
              >
                Clear saved jobs
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {jobs.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Add jobs to simulate queue processing (5-10s each, sequential).
            </p>
          ) : (
            <div className="space-y-2">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="flex items-start justify-between rounded-md border p-3 text-sm"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">Job {job.id.slice(0, 6)}</span>
                      <StatusBadge status={job.status} />
                    </div>
                    {job.runId && (
                      <p className="text-xs text-muted-foreground">
                        Inngest ID: {job.runId}
                      </p>
                    )}
                    <div className="rounded-md bg-muted/30 p-2 text-xs text-foreground whitespace-pre-wrap break-words max-h-60 overflow-auto">
                      {job.output ? formatOutput(job.output) : job.context}
                    </div>
                    <div className="text-xs text-muted-foreground space-x-3">
                      {job.startedAt && <span>Started: {formatTime(job.startedAt)}</span>}
                      {job.finishedAt && <span>Finished: {formatTime(job.finishedAt)}</span>}
                      {job.durationMs > 0 && (
                        <span>Duration: {(job.durationMs / 1000).toFixed(1)}s</span>
                      )}
                    </div>
                    {job.error && (
                      <p className="text-xs text-red-500">Error: {job.error}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {job.status === "queued" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setJobs((prev) => cancelJob(prev, job.id))}
                      >
                        Cancel
                      </Button>
                    )}
                    {job.status !== "running" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setJobs((prev) => reuseJob(prev, job))}
                      >
                        Reuse
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

type SimJobStatus = "queued" | "running" | "completed" | "cancelled";
type SimJob = {
  id: string;
  runId?: string;
  output?: any;
  error?: string;
  context: string;
  status: SimJobStatus;
  startedAt: number | null;
  finishedAt: number | null;
  durationMs: number;
};

const LS_KEY = "ksa-sim-queue-jobs";

function useSimulatedQueue(
  jobs: SimJob[],
  setJobs: React.Dispatch<React.SetStateAction<SimJob[]>>
) {
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // Poll real statuses for jobs that have a runId
  useEffect(() => {
    const active = jobs.filter(
      (j) => j.runId && j.status !== "completed" && j.status !== "cancelled"
    );
    if (active.length === 0) return;

    const interval = setInterval(async () => {
      for (const job of active) {
        try {
          const res = await fetch(`/api/jobs/${job.runId}`);
          if (!res.ok) continue;
          const data = await res.json();
          if (!data) continue;
          if (data.status === "completed") {
            setJobs((prev) =>
              prev.map((j) =>
                j.id === job.id
                  ? {
                      ...j,
                      status: "completed",
                      output: data.output ?? coerceOutput(null, job.runId),
                      error: undefined,
                      finishedAt: data.finishedAt || Date.now(),
                    }
                  : j
              )
            );
          } else if (data.status === "failed") {
            setJobs((prev) =>
              prev.map((j) =>
                j.id === job.id
                  ? {
                      ...j,
                      status: "completed",
                      error: data.error || "Failed",
                      finishedAt: data.finishedAt || Date.now(),
                    }
                  : j
              )
            );
          } else if (data.status === "running") {
            setJobs((prev) =>
              prev.map((j) =>
                j.id === job.id ? { ...j, status: "running", startedAt: Date.now() } : j
              )
            );
          }
        } catch (err) {
          console.error("Status poll failed", err);
        }
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [jobs, setJobs]);

  useEffect(() => {
    // If something is already running, wait for it to finish
    const running = jobs.find((j) => j.status === "running");
    if (running) return;

    // Grab the next queued job
    const next = jobs.find((j) => j.status === "queued");
    if (!next) return;

    // Mark it as running
    const startedAt = Date.now();
    setJobs((prev) =>
      prev.map((j) =>
        j.id === next.id ? { ...j, status: "running", startedAt } : j
      )
    );

    // Simulate work (5-10s)
    const duration = 5000 + Math.floor(Math.random() * 5000);
    const timeout = setTimeout(() => {
      setJobs((prev) =>
        prev.map((j) =>
          j.id === next.id
            ? {
              ...j,
              status: "completed",
              finishedAt: Date.now(),
              durationMs: Date.now() - (j.startedAt || startedAt),
            }
            : j
        )
      );
      timers.current.delete(next.id);
    }, duration);

    timers.current.set(next.id, timeout);
  }, [jobs, setJobs]);

  useEffect(() => {
    return () => {
      timers.current.forEach((t) => clearTimeout(t));
      timers.current.clear();
    };
  }, []);
}

function cancelJob(jobs: SimJob[], id: string): SimJob[] {
  return jobs.map((j) => (j.id === id ? { ...j, status: "cancelled" } : j));
}

function reuseJob(jobs: SimJob[], job: SimJob): SimJob[] {
  const clone: SimJob = {
    ...job,
    id: nanoid(),
    runId: job.runId,
    status: "queued",
    startedAt: null,
    finishedAt: null,
    durationMs: 0,
  };
  return [...jobs, clone];
}

function StatusBadge({ status }: { status: SimJobStatus }) {
  const color =
    status === "running"
      ? "bg-amber-500"
      : status === "completed"
        ? "bg-emerald-500"
        : status === "cancelled"
          ? "bg-red-500"
          : "bg-muted-foreground";
  return (
    <span className="inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs">
      <span className={`h-2 w-2 rounded-full ${color}`} />
      {status}
    </span>
  );
}

function formatTime(ts: number | null) {
  if (!ts) return "";
  return new Date(ts).toLocaleTimeString();
}

function formatOutput(output: any) {
  if (output && typeof output === "object") {
    return JSON.stringify(output, null, 2);
  }
  try {
    const obj = JSON.parse(output);
    if (obj && typeof obj === "object") {
      return JSON.stringify(obj, null, 2);
    }
  } catch {
    // keep raw
  }
  return output;
}

function coerceOutput(output: any, runId?: string) {
  if (!output) {
    return {
      id: runId || "unknown",
      message: "No output returned; showing fallback payload",
      random: Math.floor(Math.random() * 1000),
      status: "completed",
    };
  }
  if (typeof output === "string") return output;
  return output;
}
