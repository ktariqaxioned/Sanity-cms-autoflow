import { NextResponse } from "next/server";
import { getSanityClient } from "@autoflow/sanity-client";

export async function GET() {
  try {
    const client = getSanityClient();

    const result = await client.fetch(
      `{
        "project": *[_type == "workflow"][0]._type,
        "workflowCount": count(*[_type == "workflow"])
      }`
    );

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Sanity connection failed:", error);

    return NextResponse.json(
      { success: false, message: "Sanity connection failed." },
      { status: 500 }
    );
  }
}