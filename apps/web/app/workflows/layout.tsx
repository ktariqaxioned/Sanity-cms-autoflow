import type { ReactNode } from "react";
import WorkspaceShell from "@/components/workspace/WorkspaceShell";

export default function WorkflowsLayout({ children }: { children: ReactNode }) {
  return <WorkspaceShell section="workflows">{children}</WorkspaceShell>;
}
