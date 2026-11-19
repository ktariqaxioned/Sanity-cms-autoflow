"use client";

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
      <header className="wf-page-heading">
        <div>
          <p className="wf-eyebrow">A clear place to start</p>
          <h1>
            Tasks<span className="wf-title-count">{tasks.length}</span>
          </h1>
          <p>Get it out of your head. Make room for your next move.</p>
        </div>
        <button
          type="button"
          className="wf-button wf-button-primary"
          onClick={() => {
            setShowForm(true);
            setCreated(false);
          }}
          aria-expanded={showForm}
          aria-controls="new-task-form"
        >
          <Plus size={17} aria-hidden="true" />
          New task
        </button>
      </header>
      <section
        className="af-stat-grid"
        aria-label="Task overview for the latest 50 tasks"
      >
        <div className="af-stat-card">
          <span className="af-stat-icon">
            <ListTodo size={18} aria-hidden="true" />
          </span>
          <div>
            <span>Tasks in this view</span>
            <strong>{tasks.length}</strong>
          </div>
          <small>Latest 50, non-archived</small>
        </div>
        <div className="af-stat-card">
          <span className="af-stat-icon af-stat-amber">
            <Circle size={18} aria-hidden="true" />
          </span>
          <div>
            <span>Ready to work on</span>
            <strong>{counts.incomplete}</strong>
          </div>
          <small>Marked incomplete</small>
        </div>
        <div className="af-stat-card">
          <span className="af-stat-icon af-stat-mint">
            <Flag size={18} aria-hidden="true" />
          </span>
          <div>
            <span>Report-ready priorities</span>
            <strong>{reportReady}</strong>
          </div>
          <small>Incomplete and High priority</small>
        </div>
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
        <p className="af-success-banner" role="status">
          <Check size={16} aria-hidden="true" />
          Task added to your workspace.
          <button
            type="button"
            onClick={() => setCreated(false)}
            aria-label="Dismiss task confirmation"
          >
            <X size={14} aria-hidden="true" />
          </button>
        </p>
      )}
      <section aria-label="Task collection">
        <div className="wf-collection-toolbar">
          <div
            className="wf-tabs"
            role="group"
            aria-label="Filter tasks by status"
          >
            {filters.map((filter) => (
              <button
                key={filter.value}
                type="button"
                aria-pressed={status === filter.value}
                onClick={() => setStatus(filter.value)}
              >
                {filter.label}
                <span>{counts[filter.value]}</span>
              </button>
            ))}
          </div>
          <span className="wf-collection-caption">One thing at a time</span>
        </div>
        <div className="wf-search-toolbar af-task-toolbar">
          <div className="wf-search">
            <Search size={17} aria-hidden="true" />
            <label className="wf-sr-only" htmlFor="task-search">
              Search tasks
            </label>
            <input
              id="task-search"
              type="search"
              value={query}
              placeholder="Find a task…"
              onChange={(event) => setQuery(event.target.value)}
            />
            {query && (
              <button
                type="button"
                aria-label="Clear task search"
                onClick={() => setQuery("")}
              >
                <X size={15} aria-hidden="true" />
              </button>
            )}
          </div>
          <div className="af-toolbar-controls">
            <label className="wf-sort">
              <Flag size={14} aria-hidden="true" />
              <span className="wf-sr-only">Filter by priority</span>
              <select
                value={priority}
                onChange={(event) => setPriority(event.target.value)}
              >
                <option value="all">All priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </label>
            <label className="wf-sort">
              <ArrowDownWideNarrow size={15} aria-hidden="true" />
              <span className="wf-sr-only">Sort tasks</span>
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
              >
                <option value="newest">Newest first</option>
                <option value="priority">Priority first</option>
              </select>
            </label>
          </div>
        </div>
        <span className="wf-sr-only" role="status">
          {visible.length} tasks found.
        </span>
        {visible.length ? (
          <div className="wf-panel af-task-panel">
            <ul className="af-task-list">
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
                    className="af-task-row"
                    data-status={task.status}
                  >
                    <span className="af-task-state-icon" aria-hidden="true">
                      <Icon size={19} />
                    </span>
                    <div className="af-task-copy">
                      <h2>{task.title}</h2>
                      {task.description && <p>{task.description}</p>}
                      <div className="af-task-row-meta">
                        <TaskStatus status={task.status} />
                        {task.dueDate && (
                          <span className="af-due-date">
                            <CalendarDays size={12} aria-hidden="true" />
                            Due {formatDate(task.dueDate, false)}
                          </span>
                        )}
                      </div>
                    </div>
                    <TaskPriority priority={task.priority} />
                  </li>
                );
              })}
            </ul>
          </div>
        ) : (
          <div className="wf-empty">
            <span className="wf-empty-icon">
              <ListTodo size={28} aria-hidden="true" />
            </span>
            <h2>
              {tasks.length
                ? "No tasks match just yet."
                : "A little clarity starts here."}
            </h2>
            <p>
              {tasks.length
                ? "Try another search, status, or priority to find what you need."
                : "Add your first task, choose its priority, and let your workspace take shape."}
            </p>
            {tasks.length ? (
              <button
                type="button"
                className="wf-button wf-button-secondary"
                onClick={clearFilters}
              >
                Clear filters
              </button>
            ) : (
              <button
                type="button"
                className="wf-button wf-button-primary"
                onClick={() => setShowForm(true)}
              >
                <Plus size={16} aria-hidden="true" />
                Add your first task
              </button>
            )}
          </div>
        )}
        <div className="wf-collection-footer">
          <span>
            {visible.length} of {tasks.length} loaded tasks
          </span>
          <span>
            <span className="wf-small-dot" />
            Latest 50 non-archived tasks
          </span>
        </div>
      </section>
      <section className="af-bottom-callout">
        <span className="wf-icon-tile">
          <FileText size={20} aria-hidden="true" />
        </span>
        <div>
          <h2>See your priorities in one place.</h2>
          <p>
            Run a report of your incomplete High-priority tasks whenever you
            need a clearer picture.
          </p>
        </div>
        <Link href="/reports" className="wf-text-link">
          Open reports
          <ArrowUpRight size={15} aria-hidden="true" />
        </Link>
      </section>
    </>
  );
}
