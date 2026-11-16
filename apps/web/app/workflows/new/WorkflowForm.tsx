"use client";

import { useState } from "react";

interface Step {
  stepId: string;
  name: string;
  type: string;
  action: string;
  config: string;
}

export default function WorkflowForm() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [triggerType, setTriggerType] = useState("manual");
  const [cron, setCron] = useState("0 8 * * *");
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [documentType, setDocumentType] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [steps, setSteps] = useState<Step[]>([]);

  function addStep() {
    setSteps((current) => [
      ...current,
      {
        stepId: `step-${Date.now()}`,
        name: "",
        type: "action",
        action: "",
        config: "{}",
      },
    ]);
  }

  function updateStep(index: number, field: string, value: string) {
    setSteps((current) =>
      current.map((step, i) =>
        i === index ? { ...step, [field]: value } : step,
      ),
    );
  }

  function removeStep(index: number) {
    setSteps((current) => current.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");

    if (!name.trim()) {
      setMessage("Please enter a workflow name.");
      return;
    }

    if (steps.length === 0) {
      setMessage("Add at least one workflow step.");
      return;
    }

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];

      if (!step?.name.trim()) {
        setMessage(`Please enter a name for Step ${i + 1}.`);
        return;
      }

      if (!["action", "ai", "condition"].includes(step.type)) {
        setMessage(`Step ${i + 1} has an invalid type.`);
        return;
      }

      try {
        JSON.parse(step.config);
      } catch {
        setMessage(`Step ${i + 1} has invalid JSON configuration.`);
        return;
      }
    }

    setLoading(true);
    try {
      const response = await fetch("/api/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          trigger: {
            type: triggerType,
            ...(triggerType === "schedule" ? { cron, timezone } : {}),
            ...(triggerType === "documentEvent" ? { documentType } : {}),
          },
          steps: steps,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Workflow creation failed.");
      }

      setMessage(`Workflow created successfully! ID: ${data.workflow._id}`);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Something went wrong.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      <div>
        <label className="mb-2 block text-sm">Workflow Name</label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Morning Productivity Report"
          className="w-full rounded-lg border border-gray-700 bg-gray-900 p-3 text-white"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What should this workflow do?"
          rows={3}
          className="w-full rounded-lg border border-gray-700 bg-gray-900 p-3 text-white"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm">Trigger Type</label>
        <select
          value={triggerType}
          onChange={(e) => setTriggerType(e.target.value)}
          className="w-full rounded-lg border border-gray-700 bg-gray-900 p-3 text-white"
        >
          <option value="manual">Manual</option>
          <option value="schedule">Schedule</option>
          <option value="documentEvent">Document Event</option>
        </select>
      </div>

      {triggerType === "schedule" && (
        <>
          <div>
            <label className="mb-2 block text-sm">Cron Expression</label>
            <input
              required
              value={cron}
              onChange={(e) => setCron(e.target.value)}
              placeholder="0 8 * * *"
              className="w-full rounded-lg border border-gray-700 bg-gray-900 p-3 text-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm">Timezone</label>
            <input
              required
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full rounded-lg border border-gray-700 bg-gray-900 p-3 text-white"
            />
          </div>
        </>
      )}

      {triggerType === "documentEvent" && (
        <div>
          <label className="mb-2 block text-sm">Sanity Document Type</label>
          <input
            required
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
            placeholder="e.g. task"
            className="w-full rounded-lg border border-gray-700 bg-gray-900 p-3 text-white"
          />
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Workflow Steps</h2>

          <button
            type="button"
            onClick={addStep}
            className="rounded-lg bg-gray-800 px-4 py-2"
          >
            + Add Step
          </button>
        </div>

        {steps.map((step, index) => (
          <div
            key={step.stepId}
            className="space-y-3 rounded-xl border border-gray-700 bg-gray-900 p-5"
          >
            <div className="flex justify-between">
              <h3>Step {index + 1}</h3>

              {steps.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeStep(index)}
                  className="text-red-400"
                >
                  Remove
                </button>
              )}
            </div>

            <input
              required
              value={step.name}
              onChange={(e) => updateStep(index, "name", e.target.value)}
              placeholder="Step name"
              className="w-full rounded-lg border border-gray-700 bg-black p-3"
            />

            <select
              value={step.type}
              onChange={(e) => updateStep(index, "type", e.target.value)}
              className="w-full rounded-lg border border-gray-700 bg-black p-3"
            >
              <option value="action">Action</option>
              <option value="ai">AI Processing</option>
              <option value="condition">Condition</option>
            </select>

            <input
              value={step.action}
              onChange={(e) => updateStep(index, "action", e.target.value)}
              placeholder="Action handler"
              className="w-full rounded-lg border border-gray-700 bg-black p-3"
            />

            <textarea
              value={step.config}
              onChange={(e) => updateStep(index, "config", e.target.value)}
              placeholder='Configuration JSON: {"limit":50}'
              rows={2}
              className="w-full rounded-lg border border-gray-700 bg-black p-3"
            />
          </div>
        ))}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-500 disabled:opacity-50"
      >
        {loading ? "Creating..." : "Create Workflow"}
      </button>

      {message && <p className="break-all text-sm text-gray-300">{message}</p>}
    </form>
  );
}
