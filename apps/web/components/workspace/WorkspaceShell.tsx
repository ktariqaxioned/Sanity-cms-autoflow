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
import { cn } from "@/lib/utils";

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
    <div className="flex min-h-dvh bg-background text-sm leading-normal text-foreground antialiased max-[760px]:flex-col">
      <a
        href="#workspace-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-3 focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <aside
        className="sticky top-0 flex h-dvh w-[226px] shrink-0 flex-col border-r border-sidebar-border bg-sidebar px-[18px] pt-[30px] pb-5 max-[1200px]:w-[202px] max-[1200px]:px-3 max-[760px]:static max-[760px]:h-auto max-[760px]:w-full max-[760px]:border-r-0 max-[760px]:border-b max-[760px]:border-[#2b3039] max-[760px]:px-[22px] max-[760px]:pt-[18px] max-[760px]:pb-0"
        aria-label="Workspace sidebar"
      >
        <Link
          href="/reports"
          className="flex w-fit items-center gap-2.5 px-2 text-[23px] font-semibold tracking-tight max-[760px]:px-0 max-[760px]:text-[21px]"
        >
          <span className="grid size-[33px] place-items-center rounded-lg border border-[#36554b] bg-[#182720] text-primary max-[760px]:size-[30px]">
            <Workflow size={21} aria-hidden="true" />
          </span>
          AutoFlow<span className="-ml-2 text-primary">.</span>
        </Link>
        <div className="mt-9 mb-8 flex items-center gap-2 rounded-lg border border-border bg-[#15171c] px-2 py-3 max-[760px]:hidden">
          <span className="grid size-[29px] shrink-0 place-items-center rounded-md border border-[#48413b] bg-[#302921] text-[13px] text-[#e5b897]">
            P
          </span>
          <div>
            <strong className="block text-xs font-medium">
              Personal workspace
            </strong>
            <span className="mt-0.5 block text-[11px] text-[#858c98]">
              Your everyday, automated
            </span>
          </div>
        </div>
        <p className="mb-3 pl-3 text-[11px] font-semibold tracking-[0.17em] text-[#777f8c] uppercase max-[760px]:hidden">
          Workspace
        </p>
        <nav
          className="flex flex-col gap-1.5 max-[760px]:mt-5 max-[760px]:flex-row max-[760px]:gap-2"
          aria-label="Main navigation"
        >
          {navigation.map(({ key, href, label, icon: Icon }) => {
            const current = key === section;
            return (
              <Link
                key={key}
                href={href}
                aria-current={current ? "page" : undefined}
                className={cn(
                  "flex min-h-[43px] items-center gap-3 rounded-md border border-transparent px-3 py-2.5 text-[13px] font-medium text-[#a2a8b2] transition-colors hover:bg-[#191c22] hover:text-[#f0f2f5] max-[760px]:min-h-[39px] max-[760px]:rounded-b-none max-[760px]:px-3 max-[760px]:py-2 max-[760px]:text-xs",
                  current &&
                    "border-[#2a4239] bg-[#1a2924] text-[#a0ecd6] max-[760px]:border-b-[#1a2924]",
                )}
              >
                <Icon size={18} aria-hidden="true" />
                {label}
                {current && (
                  <span className="ml-auto size-[5px] rounded-full bg-primary max-[760px]:hidden" />
                )}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto mb-5 rounded-[10px] border border-[#292d34] bg-[#15181d] px-3 py-4 max-[760px]:hidden">
          <span className="grid size-[34px] place-items-center rounded-lg bg-[#242b2a] text-primary">
            <Layers size={19} aria-hidden="true" />
          </span>
          <h2 className="mt-3.5 text-[13px] font-medium">
            A little less busywork.
          </h2>
          <p className="mt-1.5 text-xs leading-loose text-[#8e96a1]">
            Turn your high-priority tasks into a report in one click.
          </p>
          <Link
            href="/reports"
            className="mt-4 flex items-center justify-between gap-2 text-xs font-medium text-[#a4e5d2]"
          >
            Open task reports
            <ArrowUpRight size={15} aria-hidden="true" />
          </Link>
        </div>
        <div className="flex items-center gap-2 border-t border-[#23262c] px-2.5 pt-3 text-[11px] text-[#79828e] max-[760px]:hidden">
          <span className="size-[5px] shrink-0 rounded-full bg-[#74bba4]" />
          Made for your workflow
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        <header className="flex h-[69px] items-center justify-between gap-5 border-b border-[#24272e] px-10 max-[1200px]:px-7 max-[760px]:h-12 max-[760px]:px-6 max-[440px]:pl-[18px]">
          <div className="flex items-center gap-3.5 text-xs text-[#828b97]">
            <Layers size={16} aria-hidden="true" />
            <span>Workspace</span>
            {active && (
              <>
                <ChevronRight size={13} aria-hidden="true" />
                <Link href={active.href} className="text-[#d4d9e1]">
                  {active.label}
                </Link>
              </>
            )}
          </div>
          <span className="flex items-center gap-2 text-[11px] text-[#8c959f] max-[760px]:hidden">
            <span className="size-[5px] shrink-0 rounded-full bg-[#74bba4]" />
            Run on your terms
          </span>
        </header>
        <main
          id="workspace-content"
          className="mx-auto max-w-[1270px] px-[42px] pt-[46px] pb-10 min-[1600px]:pt-[55px] max-[1200px]:px-7 max-[1200px]:py-9 max-[760px]:px-[22px] max-[760px]:py-7 max-[440px]:px-[17px]"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
