import { NextResponse } from "next/server";
import { fetchTasks } from "@autoflow/sanity-client";

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