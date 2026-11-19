"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  LoaderCircle,
  MoreHorizontal,
  Pause,
  Play,
  Trash2,
} from "lucide-react";

type Props = {
  id: string;
  name?: string;
  status: "draft" | "active" | "paused";
  redirectOnDelete?: boolean;
};

export default function WorkflowActions({
  id,
  name = "workflow",
  status,
  redirectOnDelete = false,
}: Props) {
  const router = useRouter();
  const menu = useRef<HTMLDetailsElement>(null);
  const busy = useRef(false);
  const [refreshing, startTransition] = useTransition();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function update(kind: "status" | "delete") {
    if (busy.current || refreshing) return;
    if (
      kind === "delete" &&
      !window.confirm(`Delete “${name}”? This removes the workflow definition.`)
    )
      return;
    busy.current = true;
    setPending(true);
    setError("");
    try {
      const response = await fetch(
        `/api/workflows/${encodeURIComponent(id)}`,
        kind === "delete"
          ? { method: "DELETE" }
          : {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                status: status === "active" ? "paused" : "active",
              }),
            },
      );
      const data = await response.json();
      if (!response.ok || !data.success)
        throw new Error(data.message || "Unable to update this workflow.");
      if (menu.current) menu.current.open = false;
      startTransition(() => {
        if (kind === "delete" && redirectOnDelete) router.push("/workflows");
        router.refresh();
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      busy.current = false;
      setPending(false);
    }
  }

  return (
    <div className="wf-actions" aria-busy={pending || refreshing}>
      <details
        ref={menu}
        className="wf-action-menu"
        onKeyDown={(event) => {
          if (event.key === "Escape" && menu.current) {
            menu.current.open = false;
            menu.current.querySelector("summary")?.focus();
          }
        }}
      >
        <summary
          aria-label={`More actions for ${name}`}
          title="More actions"
          className="wf-icon-button"
        >
          {pending || refreshing ? (
            <LoaderCircle
              size={18}
              className="animate-spin"
              aria-hidden="true"
            />
          ) : (
            <MoreHorizontal size={19} aria-hidden="true" />
          )}
        </summary>
        <div className="wf-menu-options">
          <p>Workflow actions</p>
          <button
            type="button"
            disabled={pending || refreshing}
            onClick={() => update("status")}
          >
            {status === "active" ? (
              <Pause size={15} aria-hidden="true" />
            ) : (
              <Play size={15} aria-hidden="true" />
            )}
            {status === "active" ? "Pause workflow" : "Activate workflow"}
          </button>
          <button
            type="button"
            className="wf-danger"
            disabled={pending || refreshing}
            onClick={() => update("delete")}
          >
            <Trash2 size={15} aria-hidden="true" />
            Delete workflow
          </button>
        </div>
      </details>
      {error && (
        <p role="alert" className="wf-action-error">
          {error}
        </p>
      )}
    </div>
  );
}
