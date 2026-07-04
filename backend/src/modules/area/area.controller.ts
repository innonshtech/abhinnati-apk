import { NextResponse } from 'next/server';
import { AreaService } from './area.service';
import { searchSchema, nearbySchema, detailsSchema } from './area.validation';

export class AreaController {
  private areaService = new AreaService();

  async handleSearch(request: Request) {
    try {
      const { searchParams } = new URL(request.url);
      const queryParams = {
        q: searchParams.get('q') || '',
        limit: searchParams.get('limit') || undefined,
      };

      const result = searchSchema.safeParse(queryParams);
      if (!result.success) {
        return NextResponse.json(
          {
            success: false,
            message: 'Validation failed',
            errors: result.error.issues.map((i) => i.message),
          },
          { status: 400 }
        );
      }

      const { q, limit } = result.data;
      const data = await this.areaService.searchAreas(q, limit);

      return NextResponse.json({
        success: true,
        data,
      });
    } catch (error: any) {
      console.error('[AreaController] search error:', error);
      return NextResponse.json(
        {
          success: false,
          message: 'Internal server error',
          errors: [error?.message || 'Something went wrong'],
        },
        { status: 500 }
      );
    }
  }

  async handleNearby(request: Request) {
    try {
      const { searchParams } = new URL(request.url);
      const queryParams = {
        latitude: searchParams.get('latitude') || '',
        longitude: searchParams.get('longitude') || '',
        radius: searchParams.get('radius') || undefined,
        limit: searchParams.get('limit') || undefined,
      };

      const result = nearbySchema.safeParse(queryParams);
      if (!result.success) {
        return NextResponse.json(
          {
            success: false,
            message: 'Validation failed',
            errors: result.error.issues.map((i) => i.message),
          },
          { status: 400 }
        );
      }

      const { latitude, longitude, radius, limit } = result.data;
      const data = await this.areaService.getNearbyAreas(latitude, longitude, radius, limit);

      return NextResponse.json({
        success: true,
        data,
      });
    } catch (error: any) {
      console.error('[AreaController] nearby error:', error);
      return NextResponse.json(
        {
          success: false,
          message: 'Internal server error',
          errors: [error?.message || 'Something went wrong'],
        },
        { status: 500 }
      );
    }
  }

  async handlePopular(request: Request) {
    try {
      const { searchParams } = new URL(request.url);
      const limitParam = searchParams.get('limit') || undefined;
      const limit = limitParam ? parseInt(limitParam, 10) : 5;

      if (isNaN(limit) || limit <= 0) {
        return NextResponse.json(
          {
            success: false,
            message: 'Validation failed',
            errors: ['Limit must be a positive number'],
          },
          { status: 400 }
        );
      }

      const data = await this.areaService.getPopularAreas(limit);

      return NextResponse.json({
        success: true,
        data,
      });
    } catch (error: any) {
      console.error('[AreaController] popular error:', error);
      return NextResponse.json(
        {
          success: false,
          message: 'Internal server error',
          errors: [error?.message || 'Something went wrong'],
        },
        { status: 500 }
      );
    }
  }

  async handleGetDetails(request: Request, id: string) {
    try {
      const result = detailsSchema.safeParse({ id });
      if (!result.success) {
        return NextResponse.json(
          {
            success: false,
            message: 'Validation failed',
            errors: result.error.issues.map((i) => i.message),
          },
          { status: 400 }
        );
      }

      const data = await this.areaService.getAreaDetails(result.data.id);
      if (!data) {
        return NextResponse.json(
          {
            success: false,
            message: 'Area not found',
            errors: ['No area matches the specified ID'],
          },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data,
      });
    } catch (error: any) {
      console.error('[AreaController] details error:', error);
      return NextResponse.json(
        {
          success: false,
          message: 'Internal server error',
          errors: [error?.message || 'Something went wrong'],
        },
        { status: 500 }
      );
    }
  }

  async handleGetAllActive(request: Request) {
    try {
      const data = await this.areaService.getAllActiveAreas();
      return NextResponse.json({
        success: true,
        data,
      });
    } catch (error: any) {
      console.error('[AreaController] getAllActive error:', error);
      return NextResponse.json(
        {
          success: false,
          message: 'Internal server error',
          errors: [error?.message || 'Something went wrong'],
        },
        { status: 500 }
      );
    }
  }
}
