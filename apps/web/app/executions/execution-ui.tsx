import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusClass: Record<string, string> = {
  completed: "border-[#2f4b40] bg-[#1e3129] text-[#9bd9b7]",
  failed: "border-[#5f3f3d] bg-[#382827] text-[#e0aaa4]",
  running: "border-[#3e4551] bg-[#272d36] text-[#bac4d0]",
  queued: "border-[#514630] bg-[#322c20] text-[#d4bb89]",
  cancelled: "border-[#414354] bg-[#2a2a37] text-[#b4afd3]",
};

export function ExecutionStatus({ status }: { status: string }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "h-auto w-fit rounded-md px-2 py-0.5 text-[10px] capitalize",
        statusClass[status] ?? "border-[#373b46] bg-[#252831] text-[#b1b7c3]",
      )}
    >
      {status}
    </Badge>
  );
}

export function executionDuration(startedAt?: string, completedAt?: string) {
  if (!startedAt || !completedAt) return "In progress";
  const ms = Date.parse(completedAt) - Date.parse(startedAt);
  if (!Number.isFinite(ms) || ms < 0) return "Unknown";
  if (ms < 1000) return `${ms} ms`;
  const seconds = Math.round(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
}
