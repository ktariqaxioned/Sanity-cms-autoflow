import Link from "next/link";
import WorkflowActions from "./WorkflowActions";

type Workflow = {
  _id: string;
  name: string;
  description?: string;
  status: "draft" | "active" | "paused";
  trigger: {
    type: string;
  };
  steps: Array<{
    stepId: string;
    name: string;
    type: string;
  }>;
  createdAt?: string;
};

async function getWorkflows(): Promise<Workflow[]> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/workflows`,
    { cache: "no-store" },
  );

  if (!response.ok) {
    throw new Error("Failed to load workflows.");
  }

  const data = await response.json();
  return data.workflows || [];
}

export default async function WorkflowsPage() {
  const workflows = await getWorkflows();

  return (
    <main className="min-h-screen bg-black p-8 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Workflows</h1>
            <p className="mt-2 text-gray-400">
              Manage your automated workflows.
            </p>
          </div>

          <Link
            href="/workflows/new"
            className="rounded-lg bg-blue-600 px-5 py-3 hover:bg-blue-500"
          >
            + Create Workflow
          </Link>
        </div>

        <div className="mt-8 space-y-4">
          {workflows.length === 0 ? (
            <p className="rounded-xl border border-gray-800 p-6 text-gray-400">
              No workflows created yet.
            </p>
          ) : (
            workflows.map((workflow) => (
              <div
                key={workflow._id}
                className="rounded-xl border border-gray-800 bg-gray-900 p-6"
              >
                <div className="flex items-center justify-between gap-4">
                  <Link
                    href={`/workflows/${workflow._id}`}
                    className="text-xl font-semibold hover:text-blue-400"
                  >
                    {workflow.name}
                  </Link>

                  <span className="rounded-full bg-gray-800 px-3 py-1 text-sm">
                    {workflow.status}
                  </span>
                </div>

                <p className="mt-2 text-sm text-gray-400">
                  {workflow.description || "No description"}
                </p>

                <div className="mt-4 flex flex-wrap gap-5 text-sm text-gray-400">
                  <span>Trigger: {workflow.trigger?.type}</span>
                  <span>Steps: {workflow.steps?.length || 0}</span>
                </div>

                <WorkflowActions id={workflow._id} status={workflow.status} />
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
