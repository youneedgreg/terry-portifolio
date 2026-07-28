import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Extracts the most useful error message from any thrown value.
 * Appwrite SDK errors include a `response` object with a richer `message`
 * and a `type` code. Safari/iOS reports bare network failures as "Load failed"
 * which is meaningless — this unwraps it to the real cause.
 */
export function getErrorMessage(err: unknown): string {
  if (!err) return "An unknown error occurred.";

  // Appwrite AppwriteException shape
  if (typeof err === "object") {
    const e = err as Record<string, unknown>;

    // Prefer the response body message (most descriptive)
    const responseMsg =
      e.response &&
      typeof e.response === "object" &&
      typeof (e.response as Record<string, unknown>).message === "string"
        ? ((e.response as Record<string, unknown>).message as string)
        : null;

    const topMsg = typeof e.message === "string" ? e.message : null;
    const type = typeof e.type === "string" ? e.type : null;

    // "Load failed" is a browser-level fetch error — surface the Appwrite type/response instead
    if (topMsg && topMsg !== "Load failed" && topMsg !== "Failed to fetch") {
      return topMsg;
    }
    if (responseMsg) return responseMsg;
    if (type) return `Request failed (${type})`;
    if (topMsg) return topMsg;
  }

  if (typeof err === "string") return err;

  return "An unexpected error occurred.";
}
