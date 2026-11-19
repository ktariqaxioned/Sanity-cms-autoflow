import type { ReactNode } from "react";
import WorkspaceShell from "@/components/workspace/WorkspaceShell";

export default function TasksLayout({ children }: { children: ReactNode }) {
  return <WorkspaceShell section="tasks">{children}</WorkspaceShell>;
}
