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
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
    <div className="relative" aria-busy={pending || refreshing}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label={`More actions for ${name}`}
            title="More actions"
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
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Workflow actions</DropdownMenuLabel>
          <DropdownMenuItem
            disabled={pending || refreshing}
            onSelect={() => update("status")}
          >
            {status === "active" ? (
              <Pause size={15} aria-hidden="true" />
            ) : (
              <Play size={15} aria-hidden="true" />
            )}
            {status === "active" ? "Pause workflow" : "Activate workflow"}
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={pending || refreshing}
            className="text-[#edbcb2] focus:bg-[#322522]"
            onSelect={() => update("delete")}
          >
            <Trash2 size={15} aria-hidden="true" />
            Delete workflow
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {error && (
        <p
          role="alert"
          className="absolute top-full right-0 z-20 mt-2 w-48 rounded-md border border-[#6b4842] bg-[#322522] px-2 py-1.5 text-[11px] leading-relaxed text-[#edbcb2]"
        >
          {error}
        </p>
      )}
    </div>
  );
}
