"use client";

import WorkspaceError from "@/components/workspace/WorkspaceError";

export default function TasksError({ reset }: { reset: () => void }) {
  return <WorkspaceError title="Couldn’t load your tasks." reset={reset} />;
}
