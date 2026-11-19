export function formatDate(value?: string, includeTime = true) {
  if (!value || Number.isNaN(Date.parse(value))) return "Not recorded";
  return (
    new Date(value).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "numeric",
      month: "short",
      year: "numeric",
      ...(includeTime ? ({ hour: "numeric", minute: "2-digit" } as const) : {}),
    }) + (includeTime ? " IST" : "")
  );
}
