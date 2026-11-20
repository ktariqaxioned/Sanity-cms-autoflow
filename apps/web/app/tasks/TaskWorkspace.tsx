"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowDownWideNarrow,
  ArrowUpRight,
  CalendarDays,
  Check,
  CheckCircle2,
  Circle,
  Clock3,
  FileText,
  Flag,
  ListTodo,
  Plus,
  Search,
  X,
} from "lucide-react";
import type { Task } from "@autoflow/sanity-client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { TaskPriority, TaskStatus } from "@/components/workspace/TaskBadges";
import { formatDate } from "@/components/workspace/format";
import TaskForm from "./TaskForm";

const filters = [
  { value: "all", label: "All tasks" },
  { value: "incomplete", label: "To do" },
  { value: "inProgress", label: "In progress" },
  { value: "completed", label: "Completed" },
] as const;
const priorityOrder: Record<string, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
};

export default function TaskWorkspace({ tasks }: { tasks: Task[] }) {
  const [showForm, setShowForm] = useState(false);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");
  const [sort, setSort] = useState("newest");
  const [created, setCreated] = useState(false);
  const counts = {
    all: tasks.length,
    incomplete: tasks.filter((task) => task.status === "incomplete").length,
    inProgress: tasks.filter((task) => task.status === "inProgress").length,
    completed: tasks.filter((task) => task.status === "completed").length,
  };
  const reportReady = tasks.filter(
    (task) => task.priority === "high" && task.status === "incomplete",
  ).length;
  const filtered = tasks.filter(
    (task) =>
      (status === "all" || task.status === status) &&
      (priority === "all" || (task.priority || "medium") === priority) &&
      `${task.title} ${task.description || ""}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
  );
  const visible =
    sort === "priority"
      ? [...filtered].sort(
          (a, b) =>
            (priorityOrder[a.priority || "medium"] ?? 4) -
            (priorityOrder[b.priority || "medium"] ?? 4),
        )
      : filtered;

  function clearFilters() {
    setQuery("");
    setStatus("all");
    setPriority("all");
  }

  return (
    <>
      <header className="mb-8 flex items-center justify-between gap-6 max-[440px]:flex-col max-[440px]:items-start">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.18em] text-[#929ba7] uppercase">
            A clear place to start
          </p>
          <h1 className="mt-2.5 mb-2 flex flex-wrap items-center gap-3 text-[clamp(1.75rem,3vw,2.25rem)] leading-tight font-medium tracking-tight">
            Tasks
            <span className="grid h-6 min-w-7 place-items-center rounded-md border border-[#343943] px-1.5 text-xs font-medium tracking-normal text-[#b0b7c1]">
              {tasks.length}
            </span>
          </h1>
          <p className="text-[13px] leading-relaxed text-[#99a1ad]">
            Get it out of your head. Make room for your next move.
          </p>
        </div>
        <Button
          type="button"
          onClick={() => {
            setShowForm(true);
            setCreated(false);
          }}
          aria-expanded={showForm}
          aria-controls="new-task-form"
        >
          <Plus size={17} aria-hidden="true" />
          New task
        </Button>
      </header>
      <section
        className="mb-8 grid grid-cols-3 gap-4 max-[1200px]:gap-3 max-[370px]:grid-cols-1 max-[760px]:mb-6 max-[760px]:gap-3"
        aria-label="Task overview for the latest 50 tasks"
      >
        <StatCard
          icon={<ListTodo size={18} aria-hidden="true" />}
          label="Tasks in this view"
          value={tasks.length}
          note="Latest 50, non-archived"
        />
        <StatCard
          tone="amber"
          icon={<Circle size={18} aria-hidden="true" />}
          label="Ready to work on"
          value={counts.incomplete}
          note="Marked incomplete"
        />
        <StatCard
          tone="mint"
          icon={<Flag size={18} aria-hidden="true" />}
          label="Report-ready priorities"
          value={reportReady}
          note="Incomplete and High priority"
        />
      </section>
      {showForm && (
        <TaskForm
          onCancel={() => setShowForm(false)}
          onCreated={() => {
            setShowForm(false);
            setCreated(true);
            clearFilters();
          }}
        />
      )}
      {created && (
        <p
          className="mb-6 flex items-center gap-2 rounded-lg border border-[#3a5246] bg-[#24362c] px-4 py-3 text-xs text-[#aad6bb]"
          role="status"
        >
          <Check size={16} aria-hidden="true" />
          Task added to your workspace.
          <button
            type="button"
            className="ml-auto cursor-pointer"
            onClick={() => setCreated(false)}
            aria-label="Dismiss task confirmation"
          >
            <X size={14} aria-hidden="true" />
          </button>
        </p>
      )}
      <section aria-label="Task collection">
        <div className="flex items-center justify-between gap-4 border-b border-[#2a2e36]">
          <div
            className="flex items-center gap-6 max-[760px]:gap-5 max-[440px]:w-full max-[440px]:justify-between"
            role="group"
            aria-label="Filter tasks by status"
          >
            {filters.map((filter) => {
              const pressed = status === filter.value;
              return (
                <button
                  key={filter.value}
                  type="button"
                  aria-pressed={pressed}
                  onClick={() => setStatus(filter.value)}
                  className={`-mb-px flex min-h-[43px] cursor-pointer items-center gap-1.5 border-b-2 pb-4 text-xs whitespace-nowrap hover:text-[#e4e9f0] max-[440px]:text-[10px] ${pressed ? "border-primary text-[#c0f1e2]" : "border-transparent text-[#929aa6]"}`}
                >
                  {filter.label}
                  <span
                    className={`rounded px-1 text-[10px] ${pressed ? "border border-[#385048] bg-[#23372f] text-[#b7e7d8]" : "border border-[#30353e] bg-[#1a1e25] text-[#a7b1bc]"}`}
                  >
                    {counts[filter.value]}
                  </span>
                </button>
              );
            })}
          </div>
          <span className="pb-3 text-[11px] text-[#747e8b] max-[1020px]:hidden">
            One thing at a time
          </span>
        </div>
        <div className="my-6 flex items-center justify-between gap-3.5 max-[1020px]:flex-wrap max-[560px]:flex-col max-[560px]:items-stretch">
          <div className="flex h-[38px] w-80 min-w-0 items-center gap-2.5 rounded-md border border-[#2e333d] bg-[#15181e] px-3 text-[#7a8493] focus-within:border-[#6d9f90] max-[1020px]:max-w-none max-[1020px]:flex-1 max-[560px]:w-full">
            <Search size={17} aria-hidden="true" />
            <label className="sr-only" htmlFor="task-search">
              Search tasks
            </label>
            <Input
              id="task-search"
              type="search"
              value={query}
              placeholder="Find a task…"
              onChange={(event) => setQuery(event.target.value)}
              className="h-auto border-0 bg-transparent px-0 text-xs shadow-none focus-visible:ring-0"
            />
            {query && (
              <button
                type="button"
                aria-label="Clear task search"
                className="cursor-pointer"
                onClick={() => setQuery("")}
              >
                <X size={15} aria-hidden="true" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 max-[560px]:w-full">
            <label className="flex h-[38px] items-center gap-2 rounded-md border border-[#2e333d] bg-[#15181e] px-3 text-[#99a3b1] max-[560px]:flex-1 max-[560px]:justify-center">
              <Flag size={14} aria-hidden="true" />
              <span className="sr-only">Filter by priority</span>
              <select
                value={priority}
                onChange={(event) => setPriority(event.target.value)}
                className="cursor-pointer bg-transparent text-xs text-foreground outline-none max-[560px]:min-w-0 max-[560px]:flex-1"
              >
                <option value="all">All priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </label>
            <label className="flex h-[38px] items-center gap-2 rounded-md border border-[#2e333d] bg-[#15181e] px-3 text-[#99a3b1] max-[560px]:flex-1 max-[560px]:justify-center">
              <ArrowDownWideNarrow size={15} aria-hidden="true" />
              <span className="sr-only">Sort tasks</span>
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
                className="cursor-pointer bg-transparent text-xs text-foreground outline-none max-[560px]:min-w-0 max-[560px]:flex-1"
              >
                <option value="newest">Newest first</option>
                <option value="priority">Priority first</option>
              </select>
            </label>
          </div>
        </div>
        <span className="sr-only" role="status">
          {visible.length} tasks found.
        </span>
        {visible.length ? (
          <Card className="gap-0 overflow-hidden rounded-[11px] bg-card py-0 ring-[#2b3039]">
            <ul>
              {visible.map((task) => {
                const Icon =
                  task.status === "completed"
                    ? CheckCircle2
                    : task.status === "inProgress"
                      ? Clock3
                      : Circle;
                return (
                  <li
                    key={task._id}
                    className="flex items-start gap-4 border-b border-[#292e37] px-5 py-5 last:border-0 max-[560px]:gap-3 max-[560px]:px-4 max-[370px]:flex-wrap"
                  >
                    <span
                      className={cn(
                        "mt-0.5 text-[#8b939e]",
                        task.status === "completed" && "text-[#9acbac]",
                        task.status === "inProgress" && "text-[#cebb92]",
                      )}
                      aria-hidden="true"
                    >
                      <Icon size={19} />
                    </span>
                    <div className="min-w-0 flex-1 max-[370px]:basis-[calc(100%-32px)]">
                      <h2
                        className={cn(
                          "text-sm font-medium max-[560px]:text-[13px]",
                          task.status === "completed" &&
                            "text-muted-foreground line-through",
                        )}
                      >
                        {task.title}
                      </h2>
                      {task.description && (
                        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[#8f9eac] max-[560px]:text-[11px]">
                          {task.description}
                        </p>
                      )}
                      <div className="mt-3 flex flex-wrap items-center gap-4 max-[560px]:gap-2.5">
                        <TaskStatus status={task.status} />
                        {task.dueDate && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-[#8a9aab]">
                            <CalendarDays size={12} aria-hidden="true" />
                            Due {formatDate(task.dueDate, false)}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="max-[370px]:ml-[30px]">
                      <TaskPriority priority={task.priority} />
                    </span>
                  </li>
                );
              })}
            </ul>
          </Card>
        ) : (
          <div className="flex flex-col items-start gap-3 rounded-[11px] border border-dashed border-border bg-card/60 px-6 py-10">
            <span className="grid size-12 place-items-center rounded-xl border border-border bg-[#1c2128] text-[#b7c0cc]">
              <ListTodo size={28} aria-hidden="true" />
            </span>
            <h2 className="text-lg font-medium">
              {tasks.length
                ? "No tasks match just yet."
                : "A little clarity starts here."}
            </h2>
            <p className="max-w-md text-[13px] leading-relaxed text-muted-foreground">
              {tasks.length
                ? "Try another search, status, or priority to find what you need."
                : "Add your first task, choose its priority, and let your workspace take shape."}
            </p>
            {tasks.length ? (
              <Button type="button" variant="secondary" onClick={clearFilters}>
                Clear filters
              </Button>
            ) : (
              <Button type="button" onClick={() => setShowForm(true)}>
                <Plus size={16} aria-hidden="true" />
                Add your first task
              </Button>
            )}
          </div>
        )}
        <div className="mt-5 flex items-center justify-between gap-3 text-[11px] text-[#747e8b]">
          <span>
            {visible.length} of {tasks.length} loaded tasks
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-primary" />
            Latest 50 non-archived tasks
          </span>
        </div>
      </section>
      <section className="mt-8 flex items-center gap-4 rounded-[11px] border border-[#31443d] bg-[#17211e] p-5 max-[760px]:flex-wrap max-[760px]:gap-3 max-[760px]:p-5">
        <span className="grid size-[34px] place-items-center rounded-lg bg-[#242b2a] text-primary">
          <FileText size={20} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-medium text-[#c5ddd2]">
            See your priorities in one place.
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-[#9bb3a8]">
            Run a report of your incomplete High-priority tasks whenever you
            need a clearer picture.
          </p>
        </div>
        <Link
          href="/reports"
          className="inline-flex items-center gap-1 text-xs font-medium text-[#a4e5d2] max-[760px]:ml-12"
        >
          Open reports
          <ArrowUpRight size={15} aria-hidden="true" />
        </Link>
      </section>
    </>
  );
}

function StatCard({
  icon,
  label,
  value,
  note,
  tone = "default",
}: {
  icon: ReactNode;
  label: string;
  value: number;
  note: string;
  tone?: "default" | "amber" | "mint";
}) {
  return (
    <div className="grid grid-cols-[35px_minmax(0,1fr)] gap-x-3 gap-y-2 rounded-[10px] border border-border bg-card p-5 max-[1020px]:grid-cols-1 max-[760px]:grid-cols-1 max-[760px]:p-4 max-[370px]:grid-cols-[35px_minmax(0,1fr)]">
      <span
        className={cn(
          "grid size-[35px] place-items-center rounded-lg border border-[#414950] bg-[#252d34] text-[#b2c5ce]",
          tone === "amber" && "border-[#544933] bg-[#332c22] text-[#d6bd8f]",
          tone === "mint" && "border-[#3a5246] bg-[#24362c] text-[#aad6bb]",
        )}
      >
        {icon}
      </span>
      <div>
        <span className="block text-[11px] leading-relaxed text-[#a6b0be] max-[760px]:text-[10px]">
          {label}
        </span>
        <strong className="mt-1 block text-3xl font-medium tracking-tight max-[760px]:mt-1.5 max-[760px]:text-[26px]">
          {value}
        </strong>
      </div>
      <small className="col-span-2 text-[10px] text-muted-foreground max-[1020px]:col-auto max-[760px]:col-span-full max-[370px]:col-start-2">
        {note}
      </small>
    </div>
  );
}
