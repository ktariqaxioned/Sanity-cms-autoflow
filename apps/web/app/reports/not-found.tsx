import Link from "next/link";

export default function ReportNotFound() {
  return (
    <main className="min-h-screen bg-black px-4 py-12 text-white">
      <div className="mx-auto max-w-xl space-y-4">
        <h1 className="text-2xl font-semibold">Report not found</h1>
        <p className="text-gray-400">
          This report may have been removed, or the link is incorrect.
        </p>
        <Link href="/reports" className="inline-block text-blue-400 underline">
          Back to saved reports
        </Link>
      </div>
    </main>
  );
}
