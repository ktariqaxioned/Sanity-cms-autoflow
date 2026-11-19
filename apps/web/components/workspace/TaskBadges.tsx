const priorities: Record<string, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};
const statuses: Record<string, string> = {
  incomplete: "Incomplete",
  inProgress: "In progress",
  completed: "Completed",
};

export function TaskPriority({ priority = "medium" }: { priority?: string }) {
  return (
    <span className="af-priority" data-priority={priority}>
      <span aria-hidden="true" />
      {priorities[priority] || priority}
    </span>
  );
}

export function TaskStatus({ status }: { status: string }) {
  return (
    <span className="af-task-status" data-status={status}>
      <span aria-hidden="true" />
      {statuses[status] || status}
    </span>
  );
}
