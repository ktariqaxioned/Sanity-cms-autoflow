import { registerAction, getRegisteredActions } from "./registry";
import { fetchTasksAction } from "./actions/fetchTasks";
import { generateTaskReportAction } from "./actions/generateTaskReport";
import { runAiAction } from "./actions/runAi";
import { saveProductivityReportAction } from "./actions/saveProductivityReport";

export function registerBuiltInActions() {
  const registered = getRegisteredActions();
  const actions = [
    ["fetchTasks", fetchTasksAction],
    ["generateTaskReport", generateTaskReportAction],
    ["runAi", runAiAction],
    ["saveProductivityReport", saveProductivityReportAction],
  ] as const;

  for (const [name, handler] of actions) {
    if (!registered.includes(name)) registerAction(name, handler);
  }
}
