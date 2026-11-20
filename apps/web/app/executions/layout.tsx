import type { ReactNode } from "react";
import WorkspaceShell from "@/components/workspace/WorkspaceShell";

export default function ExecutionsLayout({ children }: { children: ReactNode }) {
  return <WorkspaceShell section="executions">{children}</WorkspaceShell>;
}
