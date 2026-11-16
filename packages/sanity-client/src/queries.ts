import { getSanityClient } from "./client";

export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: string;
  priority?: string;
  dueDate?: string;
}

export interface Workflow {
  _id: string;
  name: string;
  description?: string;
  status: "draft" | "active" | "paused";
  createdAt?: string;
  lastExecutedAt?: string;
}

export interface WorkflowExecution {
  _id: string;
  workflow?: {
    _id: string;
    name: string;
  };
  status: string;
  startedAt?: string;
  completedAt?: string;
  error?: string;
}

export interface WorkflowLog {
  _id: string;
  execution?: {
    _id: string;
  };
  stepId?: string;
  level: string;
  message: string;
  createdAt?: string;
}

export interface WorkflowTemplate {
  _id: string;
  name: string;
  description?: string;
  category?: string;
  isFeatured?: boolean;
}

const MAX_LIMIT = 100;

function safeLimit(limit: number, fallback = 50) {
  if (!Number.isInteger(limit) || limit < 1) {
    return fallback;
  }

  return Math.min(limit, MAX_LIMIT);
}

// Fetch all non-archived tasks
export async function fetchTasks(limit = 50) {
  const client = getSanityClient();

  return client.fetch<Task[]>(
    `*[_type == "task" && isArchived != true]
      | order(_createdAt desc)[0...$limit] {
        _id,
        title,
        description,
        status,
        priority,
        dueDate
      }`,
    { limit: safeLimit(limit) }
  );
}

// Fetch incomplete tasks
export async function fetchIncompleteTasks(limit = 50) {
  const client = getSanityClient();

  return client.fetch<Task[]>(
    `*[_type == "task" && status == "incomplete" && isArchived != true]
      | order(_createdAt desc)[0...$limit] {
        _id,
        title,
        description,
        status,
        priority,
        dueDate
      }`,
    { limit: safeLimit(limit) }
  );
}

// Fetch one workflow
export async function fetchWorkflowById(id: string) {
  const client = getSanityClient();

  return client.fetch<Workflow | null>(
    `*[_type == "workflow" && _id == $id][0] {
      _id,
      name,
      description,
      status,
      createdAt,
      lastExecutedAt
    }`,
    { id }
  );
}

// Fetch active workflows
export async function fetchActiveWorkflows() {
  const client = getSanityClient();

  return client.fetch<Workflow[]>(
    `*[_type == "workflow" && status == "active"] {
      _id,
      name,
      description,
      status,
      createdAt,
      lastExecutedAt
    }`
  );
}

// Fetch workflow executions
export async function fetchWorkflowExecutions(
  workflowId?: string,
  limit = 50
) {
  const client = getSanityClient();

  return client.fetch<WorkflowExecution[]>(
    `*[_type == "workflowExecution" &&
      (!defined($workflowId) || workflow._ref == $workflowId)]
      | order(_createdAt desc)[0...$limit] {
        _id,
        workflow->{_id, name},
        status,
        startedAt,
        completedAt,
        error
      }`,
    {
      workflowId: workflowId ?? null,
      limit: safeLimit(limit),
    }
  );
}

// Fetch one execution
export async function fetchExecutionById(id: string) {
  const client = getSanityClient();

  return client.fetch<WorkflowExecution | null>(
    `*[_type == "workflowExecution" && _id == $id][0] {
      _id,
      workflow->{_id, name},
      status,
      startedAt,
      completedAt,
      error
    }`,
    { id }
  );
}

// Fetch logs for one execution
export async function fetchWorkflowLogs(
  executionId: string,
  limit = 100
) {
  const client = getSanityClient();

  return client.fetch<WorkflowLog[]>(
    `*[_type == "workflowLog" && execution._ref == $executionId]
      | order(_createdAt asc)[0...$limit] {
        _id,
        execution->{_id},
        stepId,
        level,
        message,
        createdAt
      }`,
    {
      executionId,
      limit: safeLimit(limit),
    }
  );
}

// Fetch workflow templates
export async function fetchWorkflowTemplates() {
  const client = getSanityClient();

  return client.fetch<WorkflowTemplate[]>(
    `*[_type == "workflowTemplate"]
      | order(_createdAt desc) {
        _id,
        name,
        description,
        category,
        isFeatured
      }`
  );
}