import { NextResponse } from 'next/server';

export class HttpError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public errors: any = null
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class BadRequestError extends HttpError {
  constructor(message = 'Bad Request', errors: any = null) {
    super(message, 400, errors);
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

export class ForbiddenError extends HttpError {
  constructor(message = 'Forbidden') {
    super(message, 403);
  }
}

export class NotFoundError extends HttpError {
  constructor(message = 'Not Found') {
    super(message, 404);
  }
}

export class InternalServerError extends HttpError {
  constructor(message = 'Internal Server Error', errors: any = null) {
    super(message, 500, errors);
  }
}

export class ApiResponse {
  static success(data: any, message = 'Success', statusCode = 200) {
    return NextResponse.json(
      {
        success: true,
        message,
        data,
      },
      { status: statusCode }
    );
  }

  static error(message: string, errors: any = null, statusCode = 500) {
    return NextResponse.json(
      {
        success: false,
        message,
        errors,
      },
      { status: statusCode }
    );
  }

  static handle(error: any) {
    console.error('API Error:', error);

    if (error instanceof HttpError) {
      return this.error(error.message, error.errors, error.statusCode);
    }

    if (error instanceof Error) {
      return this.error(error.message, null, 400);
    }

    return this.error('An unexpected error occurred', null, 500);
  }
}
