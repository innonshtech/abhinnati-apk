export class AppError extends Error {
  public readonly statusCode: number;
  public readonly details?: any;

  constructor(message: string, statusCode: number = 500, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed', details?: any) {
    super(message, 400, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
  }
}

export class InternalServerError extends AppError {
  constructor(message: string = 'Internal Server Error', details?: any) {
    super(message, 500, details);
  }
}

export function handleRouteError(error: any) {
  if (error instanceof AppError) {
    return {
      success: false,
      error: error.message,
      ...(error.details !== undefined && { details: error.details }),
      statusCode: error.statusCode,
    };
  }

  // Fallback for standard Errors or raw exception triggers
  const message = error instanceof Error ? error.message : 'Internal Server Error';
  return {
    success: false,
    error: message,
    statusCode: 500,
  };
}
