import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";
import WorkspaceShell from "@/components/workspace/WorkspaceShell";

export default function PageNotFound() {
  return (
    <WorkspaceShell>
      <div className="wf-empty">
        <span className="wf-empty-icon">
          <Compass size={28} aria-hidden="true" />
        </span>
        <h1>A little off the path.</h1>
        <p>This page doesn’t exist. Your workspace is just a click away.</p>
        <Link href="/workflows" className="wf-button wf-button-primary">
          <ArrowLeft size={15} aria-hidden="true" />
          Back to workflows
        </Link>
      </div>
    </WorkspaceShell>
  );
}
