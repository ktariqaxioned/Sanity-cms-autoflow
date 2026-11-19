"use client";

import WorkspaceError from "@/components/workspace/WorkspaceError";

export default function WorkflowsError({ reset }: { reset: () => void }) {
  return <WorkspaceError title="Couldn’t load your workflows." reset={reset} />;
}
