import { connection } from "next/server";
import { getSanityClient } from "@autoflow/sanity-client";
import WorkflowList from "./WorkflowList";
import type { WorkflowItem } from "./workflow-ui";

async function getWorkflows(): Promise<WorkflowItem[]> {
  return getSanityClient().fetch<WorkflowItem[]>(
    `*[_type == "workflow" && !(_id in path("drafts.**"))]
      | order(_createdAt desc) { _id, name, description, status, trigger, steps, "createdAt": coalesce(createdAt, _createdAt), lastExecutedAt }`,
  );
}

export default async function WorkflowsPage() {
  await connection();
  const workflows = await getWorkflows();

  return <WorkflowList workflows={workflows} />;
}
