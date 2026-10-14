import { categoryController } from '@/src/modules/category/category.routes';

export async function GET(request: Request) {
  return categoryController.handleGetActiveCategories(request);
}
