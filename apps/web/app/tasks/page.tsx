import { fetchTasks, type Task } from "@autoflow/sanity-client";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const dynamic = "force-dynamic";

function priorityVariant(priority?: string) {
  switch (priority) {
    case "urgent":
      return "destructive" as const;
    case "high":
      return "default" as const;
    case "low":
      return "outline" as const;
    default:
      return "secondary" as const;
  }
}

function statusLabel(status: string) {
  switch (status) {
    case "inProgress":
      return "In progress";
    case "completed":
      return "Completed";
    case "incomplete":
      return "Incomplete";
    default:
      return status;
  }
}

function formatDueDate(dueDate?: string) {
  if (!dueDate) {
    return null;
  }

  const date = new Date(dueDate);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-3xl font-semibold tabular-nums">
          {value}
        </CardTitle>
      </CardHeader>
    </Card>
  );
}

function TaskCard({ task }: { task: Task }) {
  const dueDate = formatDueDate(task.dueDate);

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>{task.title}</CardTitle>
        <CardDescription>
          {task.description || "No description"}
        </CardDescription>
        <CardAction className="flex flex-col items-end gap-2">
          <Badge
            variant={priorityVariant(task.priority)}
            className="capitalize"
          >
            {task.priority || "Medium"}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {statusLabel(task.status)}
          </span>
        </CardAction>
      </CardHeader>
      {dueDate ? (
        <CardFooter>
          <span className="text-xs text-muted-foreground">Due {dueDate}</span>
        </CardFooter>
      ) : null}
    </Card>
  );
}

export default async function TasksPage() {
  const tasks = await fetchTasks();
  const incomplete = tasks.filter((task) => task.status === "incomplete");
  const highPriority = tasks.filter(
    (task) => task.priority === "high" || task.priority === "urgent",
  );

  return (
    <main className="dark min-h-screen bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">My Tasks</h1>
          <p className="text-muted-foreground">
            Manage your tasks in AutoFlow.
          </p>
        </div>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="Total tasks" value={tasks.length} />
          <StatCard label="Incomplete" value={incomplete.length} />
          <StatCard label="High priority" value={highPriority.length} />
        </section>

        <section className="flex flex-col gap-3">
          {tasks.map((task) => (
            <TaskCard key={task._id} task={task} />
          ))}

          {tasks.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No tasks found</CardTitle>
                <CardDescription>Create your first task.</CardDescription>
              </CardHeader>
            </Card>
          ) : null}
        </section>
      </div>
    </main>
  );
}
