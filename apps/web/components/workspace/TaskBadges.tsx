import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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

const priorityClass: Record<string, string> = {
  low: "border-[#3b4b43] bg-[#252d2b] text-[#afc6b6]",
  medium: "border-[#3e4551] bg-[#272d36] text-[#bac4d0]",
  high: "border-[#574a31] bg-[#342d20] text-[#d9c395]",
  urgent: "border-[#5f3f3d] bg-[#382827] text-[#e0aaa4]",
};
const statusClass: Record<string, string> = {
  completed: "text-[#9acbac]",
  inProgress: "text-[#cebb92]",
  incomplete: "text-[#a2adbc]",
};

export function TaskPriority({ priority = "medium" }: { priority?: string }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "h-auto gap-1.5 rounded-md px-2 py-1 text-[10px] font-medium",
        priorityClass[priority] ?? priorityClass.medium,
      )}
    >
      <span className="size-1 rounded-full bg-current" aria-hidden="true" />
      {priorities[priority] || priority}
    </Badge>
  );
}

export function TaskStatus({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-[10px] text-[#a2adbc]",
        statusClass[status],
      )}
    >
      <span className="size-1 rounded-full bg-current" aria-hidden="true" />
      {statuses[status] || status}
    </span>
  );
}
