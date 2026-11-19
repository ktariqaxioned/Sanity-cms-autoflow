import Link from "next/link";
import {
  ArrowUpRight,
  CheckSquare,
  ChevronRight,
  FileText,
  GitBranch,
  Layers,
  Workflow,
} from "lucide-react";
import type { ReactNode } from "react";

type Section = "workflows" | "tasks" | "reports";
const navigation = [
  { key: "workflows", href: "/workflows", label: "Workflows", icon: GitBranch },
  { key: "tasks", href: "/tasks", label: "Tasks", icon: CheckSquare },
  { key: "reports", href: "/reports", label: "Reports", icon: FileText },
] as const;

export default function WorkspaceShell({
  section,
  children,
}: {
  section?: Section;
  children: ReactNode;
}) {
  const active = navigation.find((item) => item.key === section);
  return (
    <div className="wf-workspace">
      <a href="#workspace-content" className="wf-skip-link">
        Skip to content
      </a>
      <aside className="wf-sidebar" aria-label="Workspace sidebar">
        <Link href="/reports" className="wf-brand">
          <span className="wf-brand-mark">
            <Workflow size={21} aria-hidden="true" />
          </span>
          AutoFlow<span className="wf-brand-dot">.</span>
        </Link>
        <div className="wf-workspace-switch">
          <span className="wf-workspace-avatar">P</span>
          <div>
            <strong>Personal workspace</strong>
            <span>Your everyday, automated</span>
          </div>
        </div>
        <p className="wf-nav-label">Workspace</p>
        <nav className="wf-navigation" aria-label="Main navigation">
          {navigation.map(({ key, href, label, icon: Icon }) => (
            <Link
              key={key}
              href={href}
              className={key === section ? "is-active" : undefined}
              aria-current={key === section ? "page" : undefined}
            >
              <Icon size={18} aria-hidden="true" />
              {label}
              {key === section && <span className="wf-nav-indicator" />}
            </Link>
          ))}
        </nav>
        <div className="wf-sidebar-note">
          <span className="wf-icon-tile">
            <Layers size={19} aria-hidden="true" />
          </span>
          <h2>A little less busywork.</h2>
          <p>Turn your high-priority tasks into a report in one click.</p>
          <Link href="/reports">
            Open task reports
            <ArrowUpRight size={15} aria-hidden="true" />
          </Link>
        </div>
        <div className="wf-sidebar-footer">
          <span className="wf-small-dot" />
          Made for your workflow
        </div>
      </aside>
      <div className="wf-main">
        <header className="wf-topbar">
          <div>
            <Layers size={16} aria-hidden="true" />
            <span>Workspace</span>
            {active && (
              <>
                <ChevronRight size={13} aria-hidden="true" />
                <Link href={active.href}>{active.label}</Link>
              </>
            )}
          </div>
          <span className="wf-topbar-note">
            <span className="wf-small-dot" />
            Run on your terms
          </span>
        </header>
        <main id="workspace-content" className="wf-content">
          {children}
        </main>
      </div>
    </div>
  );
}
