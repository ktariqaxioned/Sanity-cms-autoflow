
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSanityClient } from "@autoflow/sanity-client";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function WorkflowDetailsPage({ params }: Props) {
  const { id } = await params;
  const client = getSanityClient();

  const workflow = await client.fetch(
    `*[_type == "workflow" && _id == $id][0] {
      _id,
      name,
      description,
      status,
      trigger,
      steps,
      createdAt,
      lastExecutedAt
    }`,
    { id }
  );

  if (!workflow) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-black p-8 text-white">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/workflows"
          className="text-sm text-gray-400 hover:text-white"
        >
          ← Back to Workflows
        </Link>

        <div className="mt-8">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-3xl font-bold">{workflow.name}</h1>

            <span className="rounded-full bg-gray-800 px-4 py-2 text-sm">
              {workflow.status}
            </span>
          </div>

          <p className="mt-3 text-gray-400">
            {workflow.description || "No description provided."}
          </p>
        </div>

        <section className="mt-8 rounded-xl border border-gray-800 bg-gray-900 p-6">
          <h2 className="text-xl font-semibold">Trigger Configuration</h2>

          <p className="mt-4 text-gray-300">
            Type: {workflow.trigger?.type}
          </p>

          {workflow.trigger?.type === "schedule" && (
            <>
              <p className="mt-2 text-gray-400">
                Cron: {workflow.trigger.cron}
              </p>
              <p className="mt-2 text-gray-400">
                Timezone: {workflow.trigger.timezone}
              </p>
            </>
          )}

          {workflow.trigger?.type === "documentEvent" && (
            <p className="mt-2 text-gray-400">
              Document Type: {workflow.trigger.documentType}
            </p>
          )}
        </section>

        <section className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold">
            Workflow Steps ({workflow.steps?.length || 0})
          </h2>

          {workflow.steps?.map((step: any, index: number) => (
            <div
              key={step.stepId}
              className="rounded-xl border border-gray-800 bg-gray-900 p-5"
            >
              <h3 className="font-semibold">
                {index + 1}. {step.name}
              </h3>

              <p className="mt-2 text-sm text-gray-400">
                Type: {step.type}
              </p>

              {step.action && (
                <p className="mt-2 text-sm text-gray-400">
                  Action: {step.action}
                </p>
              )}

              <div className="mt-4">
                <p className="mb-2 text-sm text-gray-400">
                  Configuration
                </p>

                <pre className="overflow-x-auto rounded-lg bg-black p-4 text-sm text-green-400">
                  {step.config || "{}"}
                </pre>
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
