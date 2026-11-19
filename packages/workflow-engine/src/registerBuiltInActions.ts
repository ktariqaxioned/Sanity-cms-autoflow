import { registerAction, getRegisteredActions } from "./registry";
import { fetchTasksAction } from "./actions/fetchTasks";
import { generateTaskReportAction } from "./actions/generateTaskReport";

export function registerBuiltInActions() {
  const registered = getRegisteredActions();

  if (!registered.includes("fetchTasks")) {
    registerAction("fetchTasks", fetchTasksAction);
  }
  if (!registered.includes("generateTaskReport")) {
    registerAction("generateTaskReport", generateTaskReportAction);
  }
}
