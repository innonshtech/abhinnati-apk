import { NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyAuth } from '@/lib/auth';
import { responseHelper } from '@/lib/response';
import { validateBody } from '@/lib/validation';
import { CategoryService } from './category.service';

const createSchema = z.object({
  name_en: z.string().min(1, 'English name is required'),
  name_mr: z.string().min(1, 'Marathi name is required'),
  iconName: z.string().min(1, 'Icon name is required'),
  slug: z.string().optional(),
  isActive: z.boolean().optional(),
  displayOrder: z.number().int().optional(),
});

const updateSchema = z.object({
  name_en: z.string().optional(),
  name_mr: z.string().optional(),
  iconName: z.string().optional(),
  slug: z.string().optional(),
  isActive: z.boolean().optional(),
  displayOrder: z.number().int().optional(),
});

export class CategoryController {
  private categoryService = new CategoryService();

  async handleGetActiveCategories(request: Request) {
    try {
      await this.categoryService.seedDefaultCategories();
      const data = await this.categoryService.getActiveCategories();
      return responseHelper.success(data);
    } catch (error: any) {
      return responseHelper.error(error);
    }
  }

  async handleGetCategory(request: Request, idOrSlug: string) {
    try {
      const data = await this.categoryService.getCategory(idOrSlug);
      return responseHelper.success(data);
    } catch (error: any) {
      return responseHelper.error(error);
    }
  }

  async handleCreateCategory(request: Request) {
    try {
      const user = await verifyAuth(request);
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      if (user.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      const body = await request.json();
      const validated = validateBody(createSchema, body);

      const data = await this.categoryService.createCategory(validated);
      return responseHelper.success(data, 'Category created successfully', 201);
    } catch (error: any) {
      return responseHelper.error(error);
    }
  }

  async handleUpdateCategory(request: Request, idOrSlug: string) {
    try {
      const user = await verifyAuth(request);
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      if (user.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      const body = await request.json();
      const validated = validateBody(updateSchema, body);

      const data = await this.categoryService.updateCategory(idOrSlug, validated);
      return responseHelper.success(data, 'Category updated successfully');
    } catch (error: any) {
      return responseHelper.error(error);
    }
  }

  async handleDeleteCategory(request: Request, idOrSlug: string) {
    try {
      const user = await verifyAuth(request);
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      if (user.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      const data = await this.categoryService.deleteCategory(idOrSlug);
      return responseHelper.success(data, 'Category deleted successfully');
    } catch (error: any) {
      return responseHelper.error(error);
    }
  }

  async handleSeedDefaults(request: Request) {
    try {
      const data = await this.categoryService.seedDefaultCategories();
      return responseHelper.success(data);
    } catch (error: any) {
      return responseHelper.error(error);
    }
  }
}
