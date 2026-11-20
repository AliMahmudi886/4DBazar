import type { ApiErrorBody, ApiErrorCode } from "@four-d/shared";

export class AppError extends Error {
  constructor(
    public readonly code: ApiErrorCode,
    message: string,
    public readonly statusCode = 400,
    public readonly fields?: Record<string, string[]>
  ) {
    super(message);
  }
}

export function toErrorBody(error: AppError, requestId: string): ApiErrorBody {
  return {
    error: {
      code: error.code,
      message: error.message,
      ...(error.fields ? { fields: error.fields } : {}),
      request_id: requestId
    }
  };
}
