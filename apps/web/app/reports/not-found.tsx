import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

export default function ReportNotFound() {
  return (
    <div className="wf-empty">
      <span className="wf-empty-icon">
        <FileText size={28} aria-hidden="true" />
      </span>
      <h1>Report not found.</h1>
      <p>This report may have been removed, or the link may be incorrect.</p>
      <Link href="/reports" className="wf-button wf-button-primary">
        <ArrowLeft size={15} aria-hidden="true" />
        Back to reports
      </Link>
    </div>
  );
}
