import { getSanityClient } from "./client";

export interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: "low" | "medium" | "high" | "urgent";
}

export async function createTask(data: CreateTaskInput) {
  const title = data.title.trim();

  if (!title) {
    throw new Error("Task title is required.");
  }

  if (title.length > 200) {
    throw new Error("Task title cannot exceed 200 characters.");
  }

  const description = data.description?.trim();

  if (description && description.length > 2000) {
    throw new Error("Description cannot exceed 2000 characters.");
  }

  const priority = data.priority ?? "medium";

  const client = getSanityClient();

  return client.create({
    _type: "task",
    title,
    description: description || undefined,
    status: "incomplete",
    priority,
    isArchived: false,
  });
}