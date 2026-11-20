import { extractJsonObject } from "./definition";

const MODEL = "gemini-3.5-flash-lite";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

export async function requestStructuredJson({
  system,
  user,
  maxTokens = 1200,
}: {
  system: string;
  user: string;
  maxTokens?: number;
}): Promise<unknown> {
  const apiKey = readGoogleApiKey();

  let response: Response;
  try {
    response = await fetch(GEMINI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: "user", parts: [{ text: user }] }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: maxTokens,
          responseMimeType: "application/json",
        },
      }),
      signal: AbortSignal.timeout(45_000),
    });
  } catch (error) {
    if (error instanceof Error && error.name === "TimeoutError") {
      throw new Error("The Gemini request timed out.");
    }
    throw new Error("The Gemini request could not be completed.");
  }

  if (!response.ok) {
    throw new Error(await readGeminiError(response));
  }

  const payload: unknown = await response.json();
  const content = readMessageContent(payload);
  try {
    return extractJsonObject(content);
  } catch {
    throw new Error("Gemini did not return valid JSON.");
  }
}

function readGoogleApiKey() {
  const apiKey = (
    process.env.GOOGLE_API_KEY ||
    process.env.GEMINI_API_KEY ||
    process.env.OPENAI_API_KEY
  )?.trim();

  if (!apiKey) {
    throw new Error(
      "Add GOOGLE_API_KEY to apps/web/.env.local before using AI steps.",
    );
  }

  return apiKey;
}

async function readGeminiError(response: Response) {
  try {
    const payload: unknown = await response.json();
    if (
      typeof payload === "object" &&
      payload !== null &&
      "error" in payload &&
      typeof payload.error === "object" &&
      payload.error !== null &&
      "message" in payload.error &&
      typeof payload.error.message === "string" &&
      payload.error.message.trim()
    ) {
      return payload.error.message.trim().slice(0, 300);
    }
  } catch {
    return `Gemini returned ${response.status}.`;
  }
  return `Gemini returned ${response.status}.`;
}

function readMessageContent(payload: unknown) {
  if (
    typeof payload !== "object" ||
    payload === null ||
    !("candidates" in payload) ||
    !Array.isArray(payload.candidates)
  ) {
    throw new Error("Gemini returned an unexpected response.");
  }
  const candidate = payload.candidates[0];
  if (
    typeof candidate !== "object" ||
    candidate === null ||
    !("content" in candidate) ||
    typeof candidate.content !== "object" ||
    candidate.content === null ||
    !("parts" in candidate.content) ||
    !Array.isArray(candidate.content.parts)
  ) {
    throw new Error("Gemini returned an empty response.");
  }
  const text = candidate.content.parts
    .map((part: unknown) =>
      typeof part === "object" &&
      part !== null &&
      "text" in part &&
      typeof part.text === "string"
        ? part.text
        : "",
    )
    .join("")
    .trim();
  if (!text) throw new Error("Gemini returned an empty response.");
  return text;
}
