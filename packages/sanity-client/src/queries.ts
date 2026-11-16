import { getSanityClient } from "./client";

export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: string;
  priority?: string;
  dueDate?: string;
}

export async function fetchIncompleteTasks(limit = 50) {
  const client = getSanityClient();

  const query = `
    *[
      _type == "task" &&
      status == "incomplete" &&
      isArchived != true
    ]
    | order(dueDate asc)[0...$limit] {
      _id,
      title,
      description,
      status,
      priority,
      dueDate
    }
  `;

  return client.fetch<Task[]>(query, { limit });
}