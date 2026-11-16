"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function TaskForm() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!title.trim()) {
      setError("Task title is required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          priority,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to create task.");
      }

      setTitle("");
      setDescription("");
      setPriority("medium");

      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-8 space-y-4 rounded-xl border border-gray-800 bg-gray-900 p-6"
    >
      <h2 className="text-xl font-semibold">Create New Task</h2>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="What needs to be done?"
        maxLength={200}
        className="w-full rounded-lg border border-gray-700 bg-gray-950 p-3 text-white outline-none focus:border-blue-500"
      />

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Task description..."
        maxLength={2000}
        rows={3}
        className="w-full rounded-lg border border-gray-700 bg-gray-950 p-3 text-white outline-none focus:border-blue-500"
      />

      <select
        value={priority}
        onChange={(e) => setPriority(e.target.value)}
        className="w-full rounded-lg border border-gray-700 bg-gray-950 p-3 text-white"
      >
        <option value="low">Low Priority</option>
        <option value="medium">Medium Priority</option>
        <option value="high">High Priority</option>
        <option value="urgent">Urgent</option>
      </select>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-500 disabled:opacity-50"
      >
        {loading ? "Creating..." : "Create Task"}
      </button>
    </form>
  );
}