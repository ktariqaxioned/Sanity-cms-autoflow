import {
  fetchIncompleteTasks,
  fetchTasks as getTasks,
} from "@autoflow/sanity-client";
import { parseActionConfig } from "../definition";
import type { ActionContext } from "../registry";

export async function fetchTasksAction({ config }: ActionContext) {
  const parsed = parseActionConfig("fetchTasks", config);
  const limit = parsed.limit ?? 50;
  const tasks =
    parsed.status === "incomplete"
      ? await fetchIncompleteTasks(limit)
      : await getTasks(limit);

  if (!Array.isArray(tasks)) {
    throw new Error("Task query did not return an array.");
  }

  return {
    count: tasks.length,
    tasks,
  };
}
