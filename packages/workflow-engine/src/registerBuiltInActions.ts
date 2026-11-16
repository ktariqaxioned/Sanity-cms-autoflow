import { registerAction, getRegisteredActions } from "./registry";
import { fetchTasksAction } from "./actions/fetchTasks";

export function registerBuiltInActions() {
  const registered = getRegisteredActions();

  if (!registered.includes("fetchTasks")) {
    registerAction("fetchTasks", fetchTasksAction);
  }
}