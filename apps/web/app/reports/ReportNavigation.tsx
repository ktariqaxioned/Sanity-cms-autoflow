import Link from "next/link";

export default function ReportNavigation() {
  return (
    <nav
      aria-label="Main navigation"
      className="mb-8 flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-gray-800 pb-5 text-sm text-gray-300"
    >
      <Link
        href="/reports"
        className="mr-auto text-lg font-semibold text-white"
      >
        AutoFlow
      </Link>
      <Link href="/tasks" className="hover:text-white">
        Tasks
      </Link>
      <Link href="/workflows" className="hover:text-white">
        Workflows
      </Link>
      <Link href="/reports" className="hover:text-white">
        Reports
      </Link>
    </nav>
  );
}
