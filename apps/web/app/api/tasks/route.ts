import { NextRequest, NextResponse } from "next/server";
import { createTask, fetchTasks } from "@autoflow/sanity-client";

export const runtime = "nodejs";

export async function GET() {
  try {
    const tasks = await fetchTasks();

    return NextResponse.json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    console.error("TASK QUERY ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Unable to fetch tasks." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();

    if (
      typeof body !== "object" ||
      body === null ||
      !("title" in body) ||
      typeof body.title !== "string"
    ) {
      return NextResponse.json(
        { success: false, message: "A valid task title is required." },
        { status: 400 }
      );
    }

    const task = await createTask({
      title: body.title,
      description:
        "description" in body &&
        typeof body.description === "string"
          ? body.description
          : undefined,
      priority:
        "priority" in body &&
        ["low", "medium", "high", "urgent"].includes(
          String(body.priority)
        )
          ? (body.priority as "low" | "medium" | "high" | "urgent")
          : "medium",
    });

    return NextResponse.json(
      { success: true, task },
      { status: 201 }
    );
  } catch (error) {
    console.error("CREATE TASK ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Unable to create task." },
      { status: 500 }
    );
  }
}