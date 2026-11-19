import { connection } from "next/server";
import {
  fetchTaskReports,
  type TaskReportSummary,
} from "@autoflow/sanity-client";
import ReportsWorkspace from "./ReportsWorkspace";

export default async function ReportsPage() {
  await connection();
  let reports: TaskReportSummary[] = [];
  let loadFailed = false;
  try {
    reports = await fetchTaskReports();
  } catch (error) {
    console.error("REPORT HISTORY ERROR:", error);
    loadFailed = true;
  }
  return <ReportsWorkspace reports={reports} loadFailed={loadFailed} />;
}
