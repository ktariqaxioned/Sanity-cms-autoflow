"use client";

import Link from "next/link";
import { RefreshCw, Unplug } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function WorkspaceError({
  title,
  reset,
  href = "/reports",
  linkLabel = "Go to reports",
}: {
  title: string;
  reset: () => void;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div
      className="flex flex-col items-start gap-3 rounded-[11px] border border-border bg-card px-6 py-8"
      role="alert"
    >
      <span className="grid size-12 place-items-center rounded-xl border border-border bg-[#1c2128] text-[#b7c0cc]">
        <Unplug size={28} aria-hidden="true" />
      </span>
      <h1 className="text-lg font-medium tracking-tight">{title}</h1>
      <p className="max-w-md text-[13px] leading-relaxed text-muted-foreground">
        There was a problem reaching your workspace. Give it another try in a
        moment.
      </p>
      <Button type="button" onClick={reset}>
        <RefreshCw size={15} aria-hidden="true" />
        Try again
      </Button>
      <Link
        href={href}
        className="inline-flex items-center gap-1.5 text-xs text-[#a4e5d2] hover:text-primary"
      >
        {linkLabel}
      </Link>
    </div>
  );
}
