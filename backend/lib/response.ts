import { NextResponse } from 'next/server';
import { handleRouteError } from './errors';
import { logger } from './logger';

export const responseHelper = {
  /**
   * Generates a standard success response representation
   */
  success: (data: any, message?: string, status: number = 200) => {
    return NextResponse.json(
      {
        success: true,
        data,
        ...(message && { message }),
      },
      { status }
    );
  },

  /**
   * Translates errors into normalized API error responses and logs the failure
   */
  error: (error: any) => {
    const errorBody = handleRouteError(error);
    
    // Log the error
    logger.error('API request route error captured:', error, { errorBody });

    return NextResponse.json(
      {
        success: false,
        error: errorBody.error,
        ...(errorBody.details !== undefined && { details: errorBody.details }),
      },
      { status: errorBody.statusCode }
    );
  },
};
