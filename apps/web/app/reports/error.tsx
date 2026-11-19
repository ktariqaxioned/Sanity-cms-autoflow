"use client";

import Link from "next/link";

export default function ReportError({ reset }: { reset: () => void }) {
  return (
    <main className="min-h-screen bg-black px-4 py-12 text-white">
      <div className="mx-auto max-w-xl space-y-5">
        <h1 className="text-2xl font-semibold">
          Couldn&apos;t load this report
        </h1>
        <p className="text-gray-400">
          Check your connection and Sanity configuration, then try again. Your
          saved report has not been changed.
        </p>
        <button onClick={reset} className="rounded-lg bg-blue-600 px-5 py-3">
          Try again
        </button>
        <Link href="/reports" className="ml-5 text-blue-400 underline">
          All reports
        </Link>
      </div>
    </main>
  );
}
