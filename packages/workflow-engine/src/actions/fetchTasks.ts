
import { fetchTasks as getTasks } from  "@autoflow/sanity-client";
import type { ActionContext } from "../registry.js";   

export async function fetchTasksAction({
  config,
}: ActionContext) {
  const tasks = await getTasks();

  if (!Array.isArray(tasks)) {
    throw new Error("Task query did not return an array.");
  }

  const configuredLimit = config.limit;

  const limit =
    typeof configuredLimit === "number" &&
    Number.isInteger(configuredLimit) &&
    configuredLimit > 0
      ? configuredLimit
      : 50;

  const limitedTasks = tasks.slice(0, limit);

  return {
    count: limitedTasks.length,
    tasks: limitedTasks,
  };
}
