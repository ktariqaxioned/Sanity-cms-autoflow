
import { NextRequest, NextResponse } from "next/server";
import { getSanityClient } from "@autoflow/sanity-client";

export const runtime = "nodejs";

type Context = {
  params: Promise<{ id: string }>;
};

export async function PATCH(
  request: NextRequest,
  { params }: Context
) {
  try {
    const { id } = await params;
    const body: unknown = await request.json();

    if (
      typeof body !== "object" ||
      body === null ||
      !("status" in body) ||
      !["draft", "active", "paused"].includes(
        String(body.status)
      )
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid workflow status." },
        { status: 400 }
      );
    }

    const client = getSanityClient();

    const workflow = await client
      .patch(id)
      .set({ status: body.status })
      .commit();

    return NextResponse.json({ success: true, workflow });
  } catch (error) {
    console.error("WORKFLOW UPDATE ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Unable to update workflow." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: Context
) {
  try {
    const { id } = await params;
    const client = getSanityClient();

    await client.delete(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("WORKFLOW DELETE ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Unable to delete workflow." },
      { status: 500 }
    );
  }
}
