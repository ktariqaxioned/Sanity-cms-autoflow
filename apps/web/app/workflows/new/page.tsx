import Link from "next/link";
import WorkflowForm from "./WorkflowForm";

export default function NewWorkflowPage() {
  return (
    <main className="min-h-screen bg-black p-8 text-white">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/"
          className="text-sm text-gray-400 hover:text-white"
        >
          ← Back to Dashboard
        </Link>

        <h1 className="mt-8 text-3xl font-bold">
          Create Workflow
        </h1>

        <p className="mt-2 text-gray-400">
          Build and automate your daily tasks.
        </p>
      </div>
      <WorkflowForm />
    </main>
  );
}