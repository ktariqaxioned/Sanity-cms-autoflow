"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Flag, LoaderCircle, Plus, X } from "lucide-react";

const priorities = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
] as const;

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
    <section
      id="new-task-form"
      className="wf-panel af-task-composer"
      aria-labelledby="new-task-heading"
    >
      <div className="wf-panel-heading">
        <div>
          <p className="wf-eyebrow">Off your mind, into your workspace</p>
          <h2 id="new-task-heading">Add a task</h2>
        </div>
        {onCancel && (
          <button
            className="wf-icon-button"
            type="button"
            onClick={onCancel}
            disabled={loading}
            aria-label="Close task form"
          >
            <X size={17} aria-hidden="true" />
          </button>
        )}
      </div>
      <form onSubmit={handleSubmit} aria-busy={loading}>
        <fieldset disabled={loading} className="af-composer-fields">
          <legend className="wf-sr-only">New task details</legend>
          <label className="wf-field">
            <span>
              What needs to be done? <span className="wf-required">*</span>
            </span>
            <input
              required
              autoFocus
              maxLength={200}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Review this week’s project priorities"
            />
          </label>
          <label className="wf-field">
            <span>
              A little more context{" "}
              <span className="wf-optional">Optional</span>
            </span>
            <textarea
              maxLength={2000}
              rows={3}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Add a note, a next step, or anything you’ll want to remember."
            />
          </label>
          <fieldset className="af-priority-picker">
            <legend>Priority</legend>
            <div>
              {priorities.map((item) => (
                <label
                  key={item.value}
                  data-priority={item.value}
                  data-selected={priority === item.value}
                >
                  <input
                    type="radio"
                    name="task-priority"
                    value={item.value}
                    checked={priority === item.value}
                    onChange={() => setPriority(item.value)}
                  />
                  <Flag size={13} aria-hidden="true" />
                  {item.label}
                </label>
              ))}
            </div>
            <p>
              High-priority tasks appear in your task report while they’re
              incomplete. Urgent is a separate priority.
            </p>
          </fieldset>
        </fieldset>
        <div className="af-composer-footer">
          {error && (
            <p className="wf-form-error" role="alert">
              {error}
            </p>
          )}
          <span>New tasks start as Incomplete.</span>
          <div>
            {onCancel && (
              <button
                type="button"
                className="wf-button wf-button-ghost"
                onClick={onCancel}
                disabled={loading}
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="wf-button wf-button-primary"
            >
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
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}
