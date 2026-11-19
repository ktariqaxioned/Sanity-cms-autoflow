"use client";

import WorkspaceError from "@/components/workspace/WorkspaceError";

export default function ReportsError({ reset }: { reset: () => void }) {
  return (
    <WorkspaceError
      title="Couldn’t load this report."
      reset={reset}
      href="/reports"
      linkLabel="All reports"
    />
  );
}
