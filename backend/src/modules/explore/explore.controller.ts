import { NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyAuth } from '@/lib/auth';
import { responseHelper } from '@/lib/response';
import { validateBody } from '@/lib/validation';
import { ExploreService } from './explore.service';

const updateAreaSchema = z.object({
  areaId: z.string().uuid('Invalid area ID format. Must be a valid UUID.'),
});

export class ExploreController {
  private exploreService = new ExploreService();

  async handleGetExplore(request: Request) {
    try {
      const user = await verifyAuth(request);
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const data = await this.exploreService.getExploreData(user.id);
      return responseHelper.success(data);
    } catch (error: any) {
      return responseHelper.error(error);
    }
  }

  async handleSearch(request: Request) {
    try {
      const user = await verifyAuth(request);
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const { searchParams } = new URL(request.url);
      const query = searchParams.get('q') || '';
      const areaId = searchParams.get('area_id') || user.activeAreaId;

      if (!areaId) {
        return NextResponse.json({ error: 'area_id is required' }, { status: 400 });
      }

      const sortByParam = searchParams.get('sort') || 'distance';
      let sortBy: 'distance' | 'popularity' | 'none' = 'distance';
      if (['distance', 'popularity'].includes(sortByParam)) {
        sortBy = sortByParam as any;
      }

      const page = parseInt(searchParams.get('page') || '1', 10);
      const limit = parseInt(searchParams.get('limit') || '10', 10);

      const data = await this.exploreService.searchMarketplace(query, areaId, sortBy, page, limit);
      return responseHelper.success(data);
    } catch (error: any) {
      return responseHelper.error(error);
    }
  }

  async handleGetCategories(request: Request) {
    try {
      const data = await this.exploreService.getCategoriesList();
      return responseHelper.success(data);
    } catch (error: any) {
      return responseHelper.error(error);
    }
  }

  async handleGetBusinesses(request: Request) {
    try {
      const user = await verifyAuth(request);
      const { searchParams } = new URL(request.url);
      const areaId = searchParams.get('area_id') || user?.activeAreaId;

      if (!areaId) {
        return NextResponse.json({ error: 'area_id is required' }, { status: 400 });
      }

      const sortByParam = searchParams.get('sort') || 'none';
      let sortBy: 'rating' | 'distance' | 'newest' | 'none' = 'none';
      if (['rating', 'distance', 'newest'].includes(sortByParam)) {
        sortBy = sortByParam as any;
      }

      const verifiedOnly = searchParams.get('verified') === 'true';
      const minRating = parseFloat(searchParams.get('rating') || '0');
      const page = parseInt(searchParams.get('page') || '1', 10);
      const limit = parseInt(searchParams.get('limit') || '10', 10);

      const data = await this.exploreService.getBusinessesList(
        areaId,
        sortBy,
        verifiedOnly,
        minRating,
        page,
        limit
      );
      return responseHelper.success(data);
    } catch (error: any) {
      return responseHelper.error(error);
    }
  }

  async handleGetCategoryBusinesses(request: Request, categorySlug: string) {
    try {
      const user = await verifyAuth(request);
      const { searchParams } = new URL(request.url);
      const areaId = searchParams.get('area_id') || user?.activeAreaId;

      if (!areaId) {
        return NextResponse.json({ error: 'area_id is required' }, { status: 400 });
      }

      const sortByParam = searchParams.get('sort') || 'none';
      let sortBy: 'rating' | 'distance' | 'newest' | 'none' = 'none';
      if (['rating', 'distance', 'newest'].includes(sortByParam)) {
        sortBy = sortByParam as any;
      }

      const verifiedOnly = searchParams.get('verified') === 'true';
      const page = parseInt(searchParams.get('page') || '1', 10);
      const limit = parseInt(searchParams.get('limit') || '10', 10);

      const data = await this.exploreService.getCategoryBusinesses(
        categorySlug,
        areaId,
        sortBy,
        verifiedOnly,
        page,
        limit
      );
      return responseHelper.success(data);
    } catch (error: any) {
      return responseHelper.error(error);
    }
  }

  async handleGetPopular(request: Request) {
    try {
      const user = await verifyAuth(request);
      const { searchParams } = new URL(request.url);
      const areaId = searchParams.get('area_id') || user?.activeAreaId;

      if (!areaId) {
        return NextResponse.json({ error: 'area_id is required' }, { status: 400 });
      }

      const data = await this.exploreService.getPopularBusinesses(areaId);
      return responseHelper.success(data);
    } catch (error: any) {
      return responseHelper.error(error);
    }
  }

  async handleGetBusinessDetail(request: Request, businessId: string) {
    try {
      const user = await verifyAuth(request);
      const activeAreaId = user?.activeAreaId || undefined;

      const data = await this.exploreService.getBusinessDetail(businessId, activeAreaId);
      return responseHelper.success(data);
    } catch (error: any) {
      return responseHelper.error(error);
    }
  }

  async handleUpdateUserArea(request: Request) {
    try {
      const user = await verifyAuth(request);
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const body = await request.json();
      const validated = validateBody(updateAreaSchema, body);

      const data = await this.exploreService.updateUserActiveArea(user.id, validated.areaId);
      return responseHelper.success(data, 'Area updated successfully');
    } catch (error: any) {
      return responseHelper.error(error);
    }
  }
}
