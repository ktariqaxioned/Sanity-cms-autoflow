import Link from "next/link";
import { ArrowLeft, GitBranch } from "lucide-react";

export default function WorkflowNotFound() {
  return (
    <div className="wf-empty">
      <span className="wf-empty-icon">
        <GitBranch size={28} aria-hidden="true" />
      </span>
      <h1>Workflow not found.</h1>
      <p>The link may be incorrect, or this workflow may have been removed.</p>
      <Link href="/workflows" className="wf-button wf-button-primary">
        <ArrowLeft size={15} aria-hidden="true" />
        Back to workflows
      </Link>
    </div>
  );
}
