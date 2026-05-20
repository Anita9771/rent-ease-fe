/**
 * Maps raw API, network, and database errors to messages suitable for end users.
 */

const TECHNICAL_PATTERNS =
  /prisma|invocation|findUnique|findMany|postgres|localhost:\d+|127\.0\.0\.1|cannot reach the api|pnpm --filter|query_engine|ECONNREFUSED|getaddrinfo|EAI_AGAIN|Failed to fetch|NetworkError|HTTP error! status:|at \w+\.|\.ts:\d+|ExceptionHandler|NestFactory/i;

const STATUS_MESSAGES: Record<number, string> = {
  400: "Some of the information you entered isn't valid. Please check the form and try again.",
  401: "Your session has expired. Please sign in again.",
  403: "You don't have permission to do that.",
  404: "We couldn't find what you're looking for. It may have been removed.",
  409: "That action conflicts with existing data. For example, this email may already be registered.",
  422: "Some of the information you entered isn't valid. Please check and try again.",
  429: "Too many requests. Please wait a moment and try again.",
  500: "Something went wrong on our side. Please try again in a few minutes.",
  502: "Our servers are temporarily unavailable. Please try again shortly.",
  503: "Our servers are temporarily unavailable. Please try again shortly.",
};

/** Known API messages that are already clear — returned as-is (normalized casing). */
const KNOWN_API_MESSAGES: Record<string, string> = {
  "email already in use": "This email is already registered. Try signing in or use a different email.",
  "invalid credentials": "Incorrect email or password. Please try again.",
  "invite not found": "This invitation link is invalid or has expired. Ask your landlord for a new invite.",
  "complaint not found": "This maintenance ticket could not be found.",
  "plan not found": "The selected plan is no longer available. Please refresh and try again.",
  "landlord not found": "We couldn't find your account details. Please sign in again.",
  "tenant not found": "We couldn't find this tenant.",
  "property not found for this landlord.": "That property doesn't belong to your account.",
  "file is required": "Please choose a file to upload.",
  "only image files are allowed": "Please upload an image file (JPG or PNG).",
  "passwords do not match": "Passwords do not match.",
  "new passwords do not match": "New passwords do not match.",
};

function extractMessage(error: unknown): string {
  if (error == null) return "";
  if (typeof error === "string") return error.trim();
  if (error instanceof Error) return error.message.trim();
  if (typeof error === "object" && "message" in error) {
    const msg = (error as { message: unknown }).message;
    if (typeof msg === "string") return msg.trim();
    if (Array.isArray(msg)) return msg.map(String).join(" ");
  }
  return String(error);
}

function normalizeValidationMessage(raw: string): string {
  return raw
    .replace(/must be a valid URL/i, "must be a valid link")
    .replace(/must be an email/i, "must be a valid email address")
    .replace(/must be longer than or equal to (\d+) characters/i, "must be at least $1 characters")
    .replace(/should not be empty/i, "is required")
    .replace(/avatarUrl/i, "Profile photo link");
}

function mapByStatusCode(status: number, bodyMessage?: string): string | null {
  if (bodyMessage) {
    const lower = bodyMessage.toLowerCase();
    const known = KNOWN_API_MESSAGES[lower];
    if (known) return known;
    if (!TECHNICAL_PATTERNS.test(bodyMessage) && bodyMessage.length < 120) {
      return normalizeValidationMessage(bodyMessage);
    }
  }
  return STATUS_MESSAGES[status] ?? null;
}

function mapNetworkFailure(): string {
  return "We can't reach the server right now. Check your internet connection, then try again. If you're running the app on your computer, make sure the backend service is started.";
}

function mapDatabaseLeak(): string {
  return "Something went wrong while saving your data. Please try again. If the problem continues, contact support.";
}

/**
 * Turn any thrown value into a short, user-friendly message.
 */
export function getUserFriendlyError(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  const raw = extractMessage(error);
  if (!raw) return fallback;

  const lower = raw.toLowerCase();

  // Already-friendly short messages from our app
  for (const [key, value] of Object.entries(KNOWN_API_MESSAGES)) {
    if (lower === key || lower.includes(key)) return value;
  }

  // Network / connectivity
  if (
    /failed to fetch|networkerror|load failed|network request failed|cannot reach the api|fetch failed/i.test(
      raw,
    ) ||
    /ECONNREFUSED|getaddrinfo|EAI_AGAIN/i.test(raw)
  ) {
    return mapNetworkFailure();
  }

  // HTTP status embedded in message (from legacy api client)
  const statusMatch = raw.match(/HTTP error! status:\s*(\d{3})/i);
  if (statusMatch) {
    const status = parseInt(statusMatch[1], 10);
    const mapped = mapByStatusCode(status);
    if (mapped) return mapped;
  }

  // Prisma / DB leaks
  if (TECHNICAL_PATTERNS.test(raw)) {
    if (/prisma|invocation|postgres|relation|constraint|unique/i.test(raw)) {
      return mapDatabaseLeak();
    }
    if (/cannot reach the api|localhost|pnpm/i.test(raw)) {
      return mapNetworkFailure();
    }
    return fallback;
  }

  // Common auth
  if (/unauthorized|invalid credentials|jwt expired|token expired/i.test(lower)) {
    return STATUS_MESSAGES[401];
  }

  // Validation-style (class-validator)
  if (/must be|should not|is required|is not allowed/i.test(raw) && raw.length < 160) {
    return normalizeValidationMessage(raw.charAt(0).toUpperCase() + raw.slice(1));
  }

  // Reasonable API message — use it
  if (raw.length <= 160 && !raw.includes("http://") && !raw.includes("https://")) {
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  }

  return fallback;
}

/**
 * Parse a failed fetch response body into a friendly message.
 */
export function getUserFriendlyHttpError(
  status: number,
  body: { message?: string | string[]; error?: string },
  fallback?: string,
): string {
  let bodyMessage = "";
  if (Array.isArray(body.message)) {
    bodyMessage = body.message.map((m) => normalizeValidationMessage(String(m))).join(" ");
  } else if (typeof body.message === "string") {
    bodyMessage = body.message;
  } else if (typeof body.error === "string") {
    bodyMessage = body.error;
  }

  const mapped = mapByStatusCode(status, bodyMessage);
  if (mapped) return mapped;

  return getUserFriendlyError(bodyMessage || `HTTP ${status}`, fallback ?? STATUS_MESSAGES[500]);
}

export class FriendlyError extends Error {
  readonly statusCode?: number;

  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = "FriendlyError";
    this.statusCode = statusCode;
  }
}
