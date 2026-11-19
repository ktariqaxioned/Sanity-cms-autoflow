import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import WorkflowForm from "./WorkflowForm";

export default function NewWorkflowPage() {
  return (
    <>
      <Link href="/workflows" className="wf-back-link">
        <ArrowLeft size={15} aria-hidden="true" />
        All workflows
      </Link>
      <header className="wf-page-heading">
        <div>
          <p className="wf-eyebrow">Make a little more time</p>
          <h1>Create a workflow</h1>
          <p>
            A clear starting point. A few useful steps. Something off your
            plate.
          </p>
        </div>
        <span className="wf-muted-tag">Saved as a draft</span>
      </header>
      <WorkflowForm />
    </>
  );
}
