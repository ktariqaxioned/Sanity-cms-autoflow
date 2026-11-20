import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import WorkflowForm from "./WorkflowForm";

export default function NewWorkflowPage() {
  return (
    <>
      <Link
        href="/workflows"
        className="mb-4 inline-flex items-center gap-1.5 text-xs text-[#a4e5d2] hover:text-primary"
      >
        <ArrowLeft size={15} aria-hidden="true" />
        All workflows
      </Link>
      <header className="mb-8 flex items-center justify-between gap-6">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.18em] text-[#929ba7] uppercase">
            Make a little more time
          </p>
          <h1 className="mt-2.5 mb-2 text-[clamp(1.75rem,3vw,2.25rem)] leading-tight font-medium tracking-tight">
            Create a workflow
          </h1>
          <p className="text-[13px] leading-relaxed text-[#99a1ad]">
            A clear starting point. A few useful steps. Something off your
            plate.
          </p>
        </div>
        <Badge
          variant="outline"
          className="h-auto rounded-md border-[#363c46] bg-[#20252d] px-2 py-1 text-[10px] text-[#a2acb9]"
        >
          Saved as a draft
        </Badge>
      </header>
      <WorkflowForm />
    </>
  );
}
