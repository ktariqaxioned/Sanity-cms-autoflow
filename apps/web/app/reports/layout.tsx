import type { ReactNode } from "react";
import WorkspaceShell from "@/components/workspace/WorkspaceShell";

export default function ReportsLayout({ children }: { children: ReactNode }) {
  return <WorkspaceShell section="reports">{children}</WorkspaceShell>;
}
