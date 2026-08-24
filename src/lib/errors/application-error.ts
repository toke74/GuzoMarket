export type ApplicationErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "INTERNAL";

const defaultMessages: Record<ApplicationErrorCode, string> = {
  BAD_REQUEST: "The request could not be processed.",
  UNAUTHORIZED: "Please sign in to continue.",
  FORBIDDEN: "You do not have permission to perform this action.",
  NOT_FOUND: "The requested resource was not found.",
  CONFLICT: "The request conflicts with the current state.",
  RATE_LIMITED: "Please wait before trying again.",
  INTERNAL: "Something went wrong. Please try again.",
};

export class ApplicationError extends Error {
  readonly code: ApplicationErrorCode;
  readonly status: number;
  readonly safeMessage: string;

  constructor(code: ApplicationErrorCode, options?: { message?: string; status?: number }) {
    super(options?.message ?? defaultMessages[code]);
    this.name = "ApplicationError";
    this.code = code;
    this.status = options?.status ?? statusForCode(code);
    this.safeMessage = defaultMessages[code];
  }
}

export function getSafeErrorMessage(error: unknown) {
  if (error instanceof ApplicationError) {
    return error.safeMessage;
  }

  if (process.env.NODE_ENV === "development") {
    console.error(error);
  }

  return defaultMessages.INTERNAL;
}

function statusForCode(code: ApplicationErrorCode) {
  switch (code) {
    case "BAD_REQUEST":
      return 400;
    case "UNAUTHORIZED":
      return 401;
    case "FORBIDDEN":
      return 403;
    case "NOT_FOUND":
      return 404;
    case "CONFLICT":
      return 409;
    case "RATE_LIMITED":
      return 429;
    case "INTERNAL":
      return 500;
  }
}
