import { connection } from "next/server";
import { fetchTasks } from "@autoflow/sanity-client";
import TaskWorkspace from "./TaskWorkspace";

export default async function TasksPage() {
  await connection();
  const tasks = await fetchTasks();
  return <TaskWorkspace tasks={tasks} />;
}
