import Link from "next/link";
import { ArrowLeft, GitBranch } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function WorkflowNotFound() {
  return (
    <div className="flex flex-col items-start gap-3 rounded-[11px] border border-dashed border-border bg-card/60 px-6 py-10">
      <span className="grid size-12 place-items-center rounded-xl border border-border bg-[#1c2128] text-[#b7c0cc]">
        <GitBranch size={28} aria-hidden="true" />
      </span>
      <h1 className="text-lg font-medium">Workflow not found.</h1>
      <p className="max-w-md text-[13px] leading-relaxed text-muted-foreground">
        The link may be incorrect, or this workflow may have been removed.
      </p>
      <Button asChild>
        <Link href="/workflows">
          <ArrowLeft size={15} aria-hidden="true" />
          Back to workflows
        </Link>
      </Button>
    </div>
  );
}
