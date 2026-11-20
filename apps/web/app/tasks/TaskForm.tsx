"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Flag, LoaderCircle, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const priorities = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
] as const;

const prioritySelected: Record<string, string> = {
  low: "border-[#3b4b43] bg-[#252d2b] text-[#afc6b6]",
  medium: "border-[#3e4551] bg-[#272d36] text-[#bac4d0]",
  high: "border-[#574a31] bg-[#342d20] text-[#d9c395]",
  urgent: "border-[#5f3f3d] bg-[#382827] text-[#e0aaa4]",
};

export default function TaskForm({
  onCancel,
  onCreated,
}: {
  onCancel?: () => void;
  onCreated?: () => void;
}) {
  const router = useRouter();
  const saving = useRef(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving.current) return;
    if (!title.trim()) {
      setError("Give your task a title before adding it.");
      return;
    }
    saving.current = true;
    setLoading(true);
    setError("");
    let created = false;
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          priority,
        }),
      });
      const result = await response.json();
      if (!response.ok || !result.success)
        throw new Error(
          result.message || "Your task couldn’t be added. Please try again.",
        );
      setTitle("");
      setDescription("");
      setPriority("medium");
      created = true;
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      saving.current = false;
      setLoading(false);
    }
    if (created) onCreated?.();
  }

  return (
    <Card
      id="new-task-form"
      className="mb-8 gap-0 rounded-[11px] bg-card py-0 ring-[#2b3039]"
      aria-labelledby="new-task-heading"
    >
      <CardHeader className="flex-row items-center justify-between border-b border-[#292e37] px-6 py-[22px]">
        <div>
          <p className="mb-1 text-[9px] font-semibold tracking-[0.18em] text-[#929ba7] uppercase">
            Off your mind, into your workspace
          </p>
          <h2 id="new-task-heading" className="text-sm font-medium">
            Add a task
          </h2>
        </div>
        {onCancel && (
          <Button
            variant="outline"
            size="icon"
            type="button"
            onClick={onCancel}
            disabled={loading}
            aria-label="Close task form"
          >
            <X size={17} aria-hidden="true" />
          </Button>
        )}
      </CardHeader>
      <form onSubmit={handleSubmit} aria-busy={loading}>
        <fieldset
          disabled={loading}
          className="grid gap-5 border-0 p-5 max-[1200px]:grid-cols-1 max-[560px]:gap-5 max-[560px]:p-5"
        >
          <legend className="sr-only">New task details</legend>
          <label className="grid gap-2 text-xs text-[#d5dbe3]">
            <span>
              What needs to be done? <span className="text-[#e7b4aa]">*</span>
            </span>
            <Input
              required
              autoFocus
              maxLength={200}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Review this week’s project priorities"
            />
          </label>
          <label className="grid gap-2 text-xs text-[#d5dbe3]">
            <span>
              A little more context{" "}
              <span className="text-muted-foreground">Optional</span>
            </span>
            <Textarea
              maxLength={2000}
              rows={3}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Add a note, a next step, or anything you’ll want to remember."
            />
          </label>
          <fieldset className="grid gap-2">
            <legend className="text-xs text-[#d5dbe3]">Priority</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {priorities.map((item) => {
                const selected = priority === item.value;
                return (
                  <label
                    key={item.value}
                    className={cn(
                      "inline-flex cursor-pointer items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs",
                      selected
                        ? prioritySelected[item.value]
                        : "border-[#303641] text-[#99a3b1]",
                    )}
                  >
                    <input
                      className="sr-only"
                      type="radio"
                      name="task-priority"
                      value={item.value}
                      checked={selected}
                      onChange={() => setPriority(item.value)}
                    />
                    <Flag size={13} aria-hidden="true" />
                    {item.label}
                  </label>
                );
              })}
            </div>
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              High-priority tasks appear in your task report while they’re
              incomplete. Urgent is a separate priority.
            </p>
          </fieldset>
        </fieldset>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#292e37] px-5 py-4 max-[560px]:[&>div]:w-full max-[560px]:[&>div]:justify-end">
          {error && (
            <p
              className="w-full rounded-md border border-[#6b4842] bg-[#322522] px-3 py-2 text-xs text-[#edbcb2]"
              role="alert"
            >
              {error}
            </p>
          )}
          <span className="text-[11px] text-[#8c959f]">
            New tasks start as Incomplete.
          </span>
          <div className="flex items-center gap-2">
            {onCancel && (
              <Button
                type="button"
                variant="ghost"
                onClick={onCancel}
                disabled={loading}
              >
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={loading}>
              {loading ? (
                <LoaderCircle
                  size={15}
                  className="animate-spin"
                  aria-hidden="true"
                />
              ) : (
                <Plus size={16} aria-hidden="true" />
              )}
              {loading ? "Adding task…" : "Add task"}
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
}
