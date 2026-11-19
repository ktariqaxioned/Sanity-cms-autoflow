"use client";

import Link from "next/link";
import { RefreshCw, Unplug } from "lucide-react";

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
    <div className="wf-empty" role="alert">
      <span className="wf-empty-icon">
        <Unplug size={28} aria-hidden="true" />
      </span>
      <h1>{title}</h1>
      <p>
        There was a problem reaching your workspace. Give it another try in a
        moment.
      </p>
      <button
        type="button"
        className="wf-button wf-button-primary"
        onClick={reset}
      >
        <RefreshCw size={15} aria-hidden="true" />
        Try again
      </button>
      <Link href={href} className="wf-back-link">
        {linkLabel}
      </Link>
    </div>
  );
}
