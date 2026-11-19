"use client";

import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  CalendarClock,
  Check,
  FileText,
  GitBranch,
  Hand,
  ListTodo,
  LoaderCircle,
  Plus,
  Save,
  Trash2,
  Webhook,
} from "lucide-react";
import { actionOptions } from "../workflow-ui";

type Action = "generateTaskReport" | "fetchTasks";
type Step = { stepId: string; name: string; action: Action; limit: number };
const initialStep: Step = {
  stepId: "step-report",
  name: "Generate task report",
  action: "generateTaskReport",
  limit: 20,
};

export default function WorkflowForm() {
  const router = useRouter();
  const saving = useRef(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [preset, setPreset] = useState("report");
  const [steps, setSteps] = useState<Step[]>([initialStep]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function choosePreset(value: "report" | "custom") {
    if (value === preset) return;
    setPreset(value);
    setSteps([
      {
        stepId: crypto.randomUUID(),
        name: value === "report" ? "Generate task report" : "Fetch tasks",
        action: value === "report" ? "generateTaskReport" : "fetchTasks",
        limit: 20,
      },
    ]);
    setError("");
  }

  function updateStep(index: number, update: Partial<Step>) {
    setSteps((current) =>
      current.map((step, i) => (i === index ? { ...step, ...update } : step)),
    );
  }

  function moveStep(index: number, direction: -1 | 1) {
    setSteps((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      const [step] = next.splice(index, 1);
      if (!step) return current;
      next.splice(target, 0, step);
      return next;
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving.current) return;
    setError("");
    if (!name.trim()) {
      setError("Give your workflow a name before saving.");
      return;
    }
    if (!steps.length) {
      setError("Add at least one action to your workflow.");
      return;
    }
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      if (!step?.name.trim()) {
        setError(`Give step ${i + 1} a name.`);
        return;
      }
      if (
        step.action === "fetchTasks" &&
        (!Number.isInteger(step.limit) || step.limit < 1 || step.limit > 50)
      ) {
        setError(`Choose between 1 and 50 tasks for step ${i + 1}.`);
        return;
      }
    }
    saving.current = true;
    setLoading(true);
    try {
      const response = await fetch("/api/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          trigger: { _type: "trigger", type: "manual" },
          steps: steps.map((step) => ({
            _key: step.stepId,
            _type: "workflowStep",
            stepId: step.stepId,
            name: step.name.trim(),
            type: "action",
            action: step.action,
            config:
              step.action === "fetchTasks"
                ? JSON.stringify({ limit: step.limit })
                : "{}",
          })),
        }),
      });
      const data = await response.json();
      if (
        !response.ok ||
        !data.success ||
        typeof data.workflow?._id !== "string"
      )
        throw new Error(
          data.message || "Your workflow couldn’t be saved. Please try again.",
        );
      router.push(`/workflows/${encodeURIComponent(data.workflow._id)}`);
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
  }

  return (
    <form onSubmit={handleSubmit} className="wf-form" aria-busy={loading}>
      <fieldset disabled={loading} className="wf-form-fields">
        <legend className="wf-sr-only">Workflow configuration</legend>
        <section className="wf-panel" aria-labelledby="starting-point-heading">
          <div className="wf-panel-heading">
            <div>
              <p className="wf-eyebrow">01 / A starting point</p>
              <h2 id="starting-point-heading">What would you like to do?</h2>
            </div>
          </div>
          <div
            className="wf-preset-options"
            role="group"
            aria-label="Workflow starting point"
          >
            <button
              type="button"
              className="wf-preset-card"
              aria-pressed={preset === "report"}
              onClick={() => choosePreset("report")}
            >
              <span className="wf-icon-tile">
                <FileText size={21} aria-hidden="true" />
              </span>
              <strong>Make a task report</strong>
              <span>
                Collect your incomplete high-priority tasks into a saved report.
              </span>
              <span className="wf-preset-check" aria-hidden="true">
                {preset === "report" && <Check size={12} />}
              </span>
            </button>
            <button
              type="button"
              className="wf-preset-card"
              aria-pressed={preset === "custom"}
              onClick={() => choosePreset("custom")}
            >
              <span className="wf-icon-tile">
                <GitBranch size={21} aria-hidden="true" />
              </span>
              <strong>Build your own</strong>
              <span>
                Choose your actions and put them in the order that works for
                you.
              </span>
              <span className="wf-preset-check" aria-hidden="true">
                {preset === "custom" && <Check size={12} />}
              </span>
            </button>
          </div>
        </section>

        <section className="wf-panel" aria-labelledby="workflow-basics-heading">
          <div className="wf-panel-heading">
            <div>
              <p className="wf-eyebrow">02 / Make it yours</p>
              <h2 id="workflow-basics-heading">The basics</h2>
            </div>
          </div>
          <div className="wf-panel-fields">
            <label className="wf-field">
              <span>
                Workflow name <span className="wf-required">*</span>
              </span>
              <input
                required
                maxLength={120}
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. My morning task report"
                autoComplete="off"
              />
              <small>
                A short name that tells you what this workflow does.
              </small>
            </label>
            <label className="wf-field">
              <span>
                Description <span className="wf-optional">Optional</span>
              </span>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                maxLength={500}
                rows={3}
                placeholder="What should this workflow take care of?"
              />
            </label>
          </div>
        </section>

        <section
          className="wf-panel"
          aria-labelledby="workflow-trigger-heading"
        >
          <div className="wf-panel-heading">
            <div>
              <p className="wf-eyebrow">03 / When it starts</p>
              <h2 id="workflow-trigger-heading">Choose a trigger</h2>
            </div>
          </div>
          <div className="wf-trigger-options">
            <div className="wf-trigger-choice is-selected">
              <Hand size={19} aria-hidden="true" />
              <div>
                <strong>On demand</strong>
                <span>You decide when. Just click Run.</span>
              </div>
              <Check size={16} aria-hidden="true" />
            </div>
            <div className="wf-trigger-choice is-unavailable">
              <CalendarClock size={19} aria-hidden="true" />
              <div>
                <strong>On a schedule</strong>
                <span>Automatically at a time you choose.</span>
              </div>
              <span className="wf-later-badge">Coming later</span>
            </div>
            <div className="wf-trigger-choice is-unavailable">
              <Webhook size={19} aria-hidden="true" />
              <div>
                <strong>On a document event</strong>
                <span>When something changes in your data.</span>
              </div>
              <span className="wf-later-badge">Coming later</span>
            </div>
          </div>
        </section>

        <section className="wf-panel" aria-labelledby="workflow-steps-heading">
          <div className="wf-panel-heading">
            <div>
              <p className="wf-eyebrow">04 / What happens next</p>
              <h2 id="workflow-steps-heading">Build your steps</h2>
            </div>
            <span className="wf-muted-tag">
              {steps.length} {steps.length === 1 ? "action" : "actions"}
            </span>
          </div>
          <div className="wf-form-steps">
            {steps.map((step, index) => (
              <div key={step.stepId} className="wf-form-step">
                <div className="wf-form-step-heading">
                  <span className="wf-step-number">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <strong>Step {index + 1}</strong>
                  <div className="wf-step-controls">
                    <button
                      type="button"
                      className="wf-icon-button"
                      disabled={index === 0}
                      aria-label={`Move step ${index + 1} up`}
                      title="Move up"
                      onClick={() => moveStep(index, -1)}
                    >
                      <ArrowUp size={15} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      className="wf-icon-button"
                      disabled={index === steps.length - 1}
                      aria-label={`Move step ${index + 1} down`}
                      title="Move down"
                      onClick={() => moveStep(index, 1)}
                    >
                      <ArrowDown size={15} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      className="wf-icon-button wf-danger"
                      aria-label={`Remove step ${index + 1}`}
                      title="Remove step"
                      onClick={() =>
                        setSteps((current) =>
                          current.filter((_, i) => i !== index),
                        )
                      }
                    >
                      <Trash2 size={15} aria-hidden="true" />
                    </button>
                  </div>
                </div>
                <label className="wf-field">
                  <span>Action</span>
                  <select
                    value={step.action}
                    onChange={(event) => {
                      const action = actionOptions.find(
                        (option) => option.value === event.target.value,
                      );
                      if (action)
                        updateStep(index, {
                          action: action.value,
                          name: action.label,
                        });
                    }}
                  >
                    {actionOptions.map((action) => (
                      <option key={action.value} value={action.value}>
                        {action.label}
                      </option>
                    ))}
                  </select>
                  <small>
                    {
                      actionOptions.find(
                        (action) => action.value === step.action,
                      )?.description
                    }
                  </small>
                </label>
                <label className="wf-field">
                  <span>Step name</span>
                  <input
                    required
                    maxLength={120}
                    value={step.name}
                    onChange={(event) =>
                      updateStep(index, { name: event.target.value })
                    }
                  />
                </label>
                {step.action === "fetchTasks" ? (
                  <label className="wf-field wf-limit-field">
                    <span>Maximum tasks</span>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      step={1}
                      required
                      value={step.limit || ""}
                      onChange={(event) =>
                        updateStep(index, {
                          limit: event.target.valueAsNumber || 0,
                        })
                      }
                    />
                    <small>Choose up to 50 non-archived tasks.</small>
                  </label>
                ) : (
                  <div className="wf-report-settings">
                    <FileText size={17} aria-hidden="true" />
                    <div>
                      <strong>Your priorities, saved.</strong>
                      <p>
                        Includes incomplete High-priority tasks. Each run saves
                        a new report.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {steps.length === 0 && (
              <p className="wf-no-steps">
                No steps yet. Add an action to get started.
              </p>
            )}
            <button
              type="button"
              className="wf-add-step"
              onClick={() =>
                setSteps((current) => [
                  ...current,
                  {
                    stepId: crypto.randomUUID(),
                    name: "Fetch tasks",
                    action: "fetchTasks",
                    limit: 20,
                  },
                ])
              }
            >
              <Plus size={16} aria-hidden="true" />
              Add another step
            </button>
          </div>
        </section>
      </fieldset>

      <aside className="wf-form-preview" aria-label="Workflow preview">
        <div className="wf-panel">
          <div className="wf-panel-heading">
            <div>
              <p className="wf-eyebrow">The big picture</p>
              <h2>Your workflow</h2>
            </div>
            <GitBranch size={18} className="wf-muted-icon" aria-hidden="true" />
          </div>
          <div className="wf-preview-body">
            <h3>{name.trim() || "Untitled workflow"}</h3>
            <p>
              {description.trim() ||
                "A few connected steps to make your day a little easier."}
            </p>
            <ol className="wf-preview-flow">
              <li>
                <span>
                  <Hand size={15} aria-hidden="true" />
                </span>
                <div>
                  <small>Trigger</small>
                  <strong>Run on demand</strong>
                </div>
              </li>
              {steps.map((step, index) => (
                <li key={step.stepId}>
                  <span>
                    {step.action === "generateTaskReport" ? (
                      <FileText size={15} aria-hidden="true" />
                    ) : (
                      <ListTodo size={15} aria-hidden="true" />
                    )}
                  </span>
                  <div>
                    <small>Step {index + 1}</small>
                    <strong>{step.name.trim() || "Untitled step"}</strong>
                  </div>
                </li>
              ))}
            </ol>
            <p className="wf-preview-note">
              <Check size={15} aria-hidden="true" />
              Saved as a draft. Run it when you&apos;re ready.
            </p>
          </div>
        </div>
        <div className="wf-form-tip">
          <strong>Keep it simple to start.</strong>
          <p>
            One useful action is a great first workflow. You can build up from
            there.
          </p>
        </div>
      </aside>

      <div className="wf-form-footer">
        {error && (
          <p role="alert" className="wf-form-error">
            {error}
          </p>
        )}
        <span>
          <span className="wf-small-dot" />
          Save now. Run whenever you’re ready.
        </span>
        <div>
          <Link href="/workflows" className="wf-button wf-button-ghost">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="wf-button wf-button-primary"
          >
            {loading ? (
              <LoaderCircle
                className="animate-spin"
                size={16}
                aria-hidden="true"
              />
            ) : (
              <Save size={16} aria-hidden="true" />
            )}
            {loading ? "Saving workflow…" : "Create workflow"}
            <ArrowRight size={15} aria-hidden="true" />
          </button>
        </div>
      </div>
    </form>
  );
}
