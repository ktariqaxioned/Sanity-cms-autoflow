
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type Props = {
  id: string;
  status: "draft" | "active" | "paused";
};

export default function WorkflowActions({ id, status }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  async function updateStatus() {
    const nextStatus = status === "active" ? "paused" : "active";

    setError("");

    try {
      const response = await fetch(`/api/workflows/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Status update failed.");
      }

      startTransition(() => router.refresh());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  async function deleteWorkflow() {
    if (!window.confirm("Are you sure you want to delete this workflow?")) {
      return;
    }

    setError("");

    try {
      const response = await fetch(`/api/workflows/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Delete failed.");
      }

      startTransition(() => router.refresh());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <div className="mt-5 flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={updateStatus}
        disabled={isPending}
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm hover:bg-blue-500 disabled:opacity-50"
      >
        {isPending
          ? "Updating..."
          : status === "active"
            ? "Pause Workflow"
            : "Activate Workflow"}
      </button>

      <button
        type="button"
        onClick={deleteWorkflow}
        disabled={isPending}
        className="rounded-lg border border-red-500 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 disabled:opacity-50"
      >
        Delete
      </button>

      {error && (
        <p className="w-full text-sm text-red-400">{error}</p>
      )}
    </div>
  );
}
