"use client";

import Link from "next/link";
import { useRef, useState, type FormEvent, type ReactNode } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { actionOptions } from "../workflow-ui";

type Action = "generateTaskReport" | "fetchTasks";
type Step = { stepId: string; name: string; action: Action; limit: number };
const initialStep: Step = {
  stepId: "step-report",
  name: "Generate task report",
  action: "generateTaskReport",
  limit: 20,
};

const fieldClass = "grid gap-2 text-xs text-[#d5dbe3]";
const hintClass = "text-[11px] leading-relaxed text-muted-foreground";
const selectClass =
  "h-10 w-full cursor-pointer rounded-md border border-input bg-[#12151a] px-3 text-xs text-foreground outline-none focus-visible:border-[#6d9f90] focus-visible:ring-2 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-45";

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
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-[minmax(0,1fr)_280px] items-start gap-6 max-[1200px]:grid-cols-[minmax(0,1fr)_235px] max-[1200px]:gap-5 max-[1020px]:grid-cols-1"
      aria-busy={loading}
    >
      <fieldset disabled={loading} className="grid min-w-0 gap-6 border-0 p-0">
        <legend className="sr-only">Workflow configuration</legend>
        <Card className="gap-0 rounded-[11px] bg-card py-0 ring-[#2b3039]">
          <CardHeader className="flex-row items-center justify-between border-b border-[#292e37] px-6 py-[22px]">
            <div>
              <p className="mb-1 text-[9px] font-semibold tracking-[0.18em] text-[#929ba7] uppercase">
                01 / A starting point
              </p>
              <h2 id="starting-point-heading" className="text-sm font-medium">
                What would you like to do?
              </h2>
            </div>
          </CardHeader>
          <CardContent
            className="grid grid-cols-2 gap-3 p-5 max-[440px]:grid-cols-1"
            role="group"
            aria-label="Workflow starting point"
          >
            <PresetCard
              pressed={preset === "report"}
              title="Make a task report"
              description="Collect your incomplete high-priority tasks into a saved report."
              icon={<FileText size={21} aria-hidden="true" />}
              onClick={() => choosePreset("report")}
            />
            <PresetCard
              pressed={preset === "custom"}
              title="Build your own"
              description="Choose your actions and put them in the order that works for you."
              icon={<GitBranch size={21} aria-hidden="true" />}
              onClick={() => choosePreset("custom")}
            />
          </CardContent>
        </Card>

        <Card className="gap-0 rounded-[11px] bg-card py-0 ring-[#2b3039]">
          <CardHeader className="border-b border-[#292e37] px-6 py-[22px]">
            <p className="mb-1 text-[9px] font-semibold tracking-[0.18em] text-[#929ba7] uppercase">
              02 / Make it yours
            </p>
            <h2 id="workflow-basics-heading" className="text-sm font-medium">
              The basics
            </h2>
          </CardHeader>
          <CardContent className="grid gap-5 p-5">
            <label className={fieldClass}>
              <span>
                Workflow name <span className="text-[#e7b4aa]">*</span>
              </span>
              <Input
                required
                maxLength={120}
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. My morning task report"
                autoComplete="off"
              />
              <small className={hintClass}>
                A short name that tells you what this workflow does.
              </small>
            </label>
            <label className={fieldClass}>
              <span>
                Description <span className="text-muted-foreground">Optional</span>
              </span>
              <Textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                maxLength={500}
                rows={3}
                placeholder="What should this workflow take care of?"
              />
            </label>
          </CardContent>
        </Card>

        <Card className="gap-0 rounded-[11px] bg-card py-0 ring-[#2b3039]">
          <CardHeader className="border-b border-[#292e37] px-6 py-[22px]">
            <p className="mb-1 text-[9px] font-semibold tracking-[0.18em] text-[#929ba7] uppercase">
              03 / When it starts
            </p>
            <h2 id="workflow-trigger-heading" className="text-sm font-medium">
              Choose a trigger
            </h2>
          </CardHeader>
          <CardContent className="grid gap-3 p-5">
            <div className="flex items-center gap-3 rounded-lg border border-[#2a4239] bg-[#1a2924] px-4 py-3 text-[#a0ecd6] max-[440px]:flex-wrap">
              <Hand size={19} aria-hidden="true" />
              <div className="min-w-0 flex-1 max-[440px]:min-w-[145px]">
                <strong className="block text-sm font-medium">On demand</strong>
                <span className="text-xs text-[#8fb8aa]">
                  You decide when. Just click Run.
                </span>
              </div>
              <Check size={16} aria-hidden="true" />
            </div>
            <UnavailableTrigger
              icon={<CalendarClock size={19} aria-hidden="true" />}
              title="On a schedule"
              description="Automatically at a time you choose."
            />
            <UnavailableTrigger
              icon={<Webhook size={19} aria-hidden="true" />}
              title="On a document event"
              description="When something changes in your data."
            />
          </CardContent>
        </Card>

        <Card className="gap-0 rounded-[11px] bg-card py-0 ring-[#2b3039]">
          <CardHeader className="flex-row items-center justify-between border-b border-[#292e37] px-6 py-[22px]">
            <div>
              <p className="mb-1 text-[9px] font-semibold tracking-[0.18em] text-[#929ba7] uppercase">
                04 / What happens next
              </p>
              <h2 id="workflow-steps-heading" className="text-sm font-medium">
                Build your steps
              </h2>
            </div>
            <Badge
              variant="outline"
              className="h-auto rounded-md border-[#363c46] bg-[#20252d] px-2 py-1 text-[10px] text-[#a2acb9]"
            >
              {steps.length} {steps.length === 1 ? "action" : "actions"}
            </Badge>
          </CardHeader>
          <CardContent className="grid gap-3 p-5">
            {steps.map((step, index) => (
              <div
                key={step.stepId}
                className="grid gap-4 rounded-lg border border-[#2e343d] bg-[#14171c] p-4 max-[440px]:p-3.5"
              >
                <div className="flex items-center gap-3">
                  <span className="grid size-8 place-items-center rounded-lg border border-[#3d4943] bg-[#242d28] text-[10px] text-[#b0ccbc]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <strong className="text-sm font-medium">
                    Step {index + 1}
                  </strong>
                  <div className="ml-auto flex gap-1 max-[440px]:gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      disabled={index === 0}
                      aria-label={`Move step ${index + 1} up`}
                      title="Move up"
                      onClick={() => moveStep(index, -1)}
                    >
                      <ArrowUp size={15} aria-hidden="true" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      disabled={index === steps.length - 1}
                      aria-label={`Move step ${index + 1} down`}
                      title="Move down"
                      onClick={() => moveStep(index, 1)}
                    >
                      <ArrowDown size={15} aria-hidden="true" />
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      aria-label={`Remove step ${index + 1}`}
                      title="Remove step"
                      onClick={() =>
                        setSteps((current) =>
                          current.filter((_, i) => i !== index),
                        )
                      }
                    >
                      <Trash2 size={15} aria-hidden="true" />
                    </Button>
                  </div>
                </div>
                <label className={fieldClass}>
                  <span>Action</span>
                  <select
                    className={selectClass}
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
                  <small className={hintClass}>
                    {
                      actionOptions.find(
                        (action) => action.value === step.action,
                      )?.description
                    }
                  </small>
                </label>
                <label className={fieldClass}>
                  <span>Step name</span>
                  <Input
                    required
                    maxLength={120}
                    value={step.name}
                    onChange={(event) =>
                      updateStep(index, { name: event.target.value })
                    }
                  />
                </label>
                {step.action === "fetchTasks" ? (
                  <label className={cn(fieldClass, "max-w-40")}>
                    <span>Maximum tasks</span>
                    <Input
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
                    <small className={hintClass}>
                      Choose up to 50 non-archived tasks.
                    </small>
                  </label>
                ) : (
                  <div className="flex gap-3 rounded-lg border border-[#31443d] bg-[#17211e] p-3 text-[#c5ddd2] max-[440px]:p-2.5">
                    <FileText size={17} aria-hidden="true" className="mt-0.5 shrink-0" />
                    <div>
                      <strong className="block text-xs font-medium">
                        Your priorities, saved.
                      </strong>
                      <p className="mt-1 text-[11px] leading-relaxed text-[#9bb3a8]">
                        Includes incomplete High-priority tasks. Each run saves
                        a new report.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {steps.length === 0 && (
              <p className="text-xs text-muted-foreground">
                No steps yet. Add an action to get started.
              </p>
            )}
            <button
              type="button"
              className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-[#3a424c] text-xs font-medium text-[#c5ccd6] hover:border-[#52665e] hover:bg-[#1a1f26]"
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
          </CardContent>
        </Card>
      </fieldset>

      <aside
        className="sticky top-6 grid gap-4 max-[1020px]:static"
        aria-label="Workflow preview"
      >
        <Card className="gap-0 rounded-[11px] bg-card py-0 ring-[#2b3039]">
          <CardHeader className="flex-row items-center justify-between border-b border-[#292e37] px-6 py-[22px] max-[1200px]:p-5">
            <div>
              <p className="mb-1 text-[9px] font-semibold tracking-[0.18em] text-[#929ba7] uppercase">
                The big picture
              </p>
              <h2 className="text-sm font-medium">Your workflow</h2>
            </div>
            <GitBranch size={18} className="text-muted-foreground" aria-hidden="true" />
          </CardHeader>
          <CardContent className="grid gap-3 p-5">
            <h3 className="text-sm font-medium">
              {name.trim() || "Untitled workflow"}
            </h3>
            <p className="text-xs leading-relaxed text-muted-foreground">
              {description.trim() ||
                "A few connected steps to make your day a little easier."}
            </p>
            <ol className="mt-2 grid">
              <li className="relative flex gap-3 pb-4 before:absolute before:top-8 before:bottom-0 before:left-4 before:w-px before:bg-[#384139]">
                <span className="relative z-10 grid size-8 shrink-0 place-items-center rounded-lg border border-[#5c5037] bg-[#352f23] text-[#e3cd9d]">
                  <Hand size={15} aria-hidden="true" />
                </span>
                <div>
                  <small className="text-[10px] text-[#8796a5]">Trigger</small>
                  <strong className="block text-xs font-medium">
                    Run on demand
                  </strong>
                </div>
              </li>
              {steps.map((step, index) => (
                <li
                  key={step.stepId}
                  className="relative flex gap-3 pb-4 last:pb-0 last:before:hidden before:absolute before:top-8 before:bottom-0 before:left-4 before:w-px before:bg-[#384139]"
                >
                  <span className="relative z-10 grid size-8 shrink-0 place-items-center rounded-lg border border-[#3d4943] bg-[#242d28] text-[#b0ccbc]">
                    {step.action === "generateTaskReport" ? (
                      <FileText size={15} aria-hidden="true" />
                    ) : (
                      <ListTodo size={15} aria-hidden="true" />
                    )}
                  </span>
                  <div>
                    <small className="text-[10px] text-[#8796a5]">
                      Step {index + 1}
                    </small>
                    <strong className="block text-xs font-medium">
                      {step.name.trim() || "Untitled step"}
                    </strong>
                  </div>
                </li>
              ))}
            </ol>
            <p className="flex items-start gap-2 text-[11px] leading-relaxed text-[#9bb3a8]">
              <Check size={15} aria-hidden="true" className="mt-0.5 shrink-0" />
              Saved as a draft. Run it when you&apos;re ready.
            </p>
          </CardContent>
        </Card>
        <div className="rounded-[11px] border border-[#31443d] bg-[#17211e] p-4 max-[1020px]:hidden">
          <strong className="text-xs font-medium text-[#c5ddd2]">
            Keep it simple to start.
          </strong>
          <p className="mt-1.5 text-[11px] leading-relaxed text-[#9bb3a8]">
            One useful action is a great first workflow. You can build up from
            there.
          </p>
        </div>
      </aside>

      <div className="col-span-full flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4 max-[760px]:items-start max-[440px]:[&>div]:w-full">
        {error && (
          <p
            role="alert"
            className="w-full rounded-md border border-[#6b4842] bg-[#322522] px-3 py-2 text-xs text-[#edbcb2]"
          >
            {error}
          </p>
        )}
        <span className="inline-flex items-center gap-2 text-[11px] text-[#8c959f]">
          <span className="size-1.5 rounded-full bg-primary" />
          Save now. Run whenever you’re ready.
        </span>
        <div className="flex items-center gap-2 max-[440px]:w-full max-[440px]:[&>button]:flex-1">
          <Button asChild variant="ghost">
            <Link href="/workflows">Cancel</Link>
          </Button>
          <Button type="submit" disabled={loading}>
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
          </Button>
        </div>
      </div>
    </form>
  );
}

function PresetCard({
  pressed,
  title,
  description,
  icon,
  onClick,
}: {
  pressed: boolean;
  title: string;
  description: string;
  icon: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        "relative flex cursor-pointer flex-col items-start gap-3 rounded-lg border px-4 py-4 text-left hover:border-[#52665e] max-[440px]:gap-2",
        pressed
          ? "border-[#2a4239] bg-[#1a2924]"
          : "border-[#2e343d] bg-[#14171c]",
      )}
    >
      <span className="grid size-[34px] place-items-center rounded-lg bg-[#242b2a] text-primary">
        {icon}
      </span>
      <strong className="text-sm font-medium">{title}</strong>
      <span className="text-xs leading-relaxed text-muted-foreground">
        {description}
      </span>
      <span
        className={cn(
          "absolute top-3 right-3 grid size-5 place-items-center rounded-full border",
          pressed
            ? "border-primary bg-primary text-primary-foreground"
            : "border-[#3a424c]",
        )}
        aria-hidden="true"
      >
        {pressed && <Check size={12} />}
      </span>
    </button>
  );
}

function UnavailableTrigger({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-[#2e343d] bg-[#14171c] px-4 py-3 text-[#8b939e] max-[440px]:flex-wrap">
      {icon}
      <div className="min-w-0 flex-1 max-[440px]:min-w-[145px]">
        <strong className="block text-sm font-medium text-[#c5ccd6]">
          {title}
        </strong>
        <span className="text-xs">{description}</span>
      </div>
      <Badge
        variant="outline"
        className="h-auto rounded-md px-2 py-0.5 text-[10px] text-muted-foreground max-[440px]:ml-7"
      >
        Coming later
      </Badge>
    </div>
  );
}
