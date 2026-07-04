import { categoryController } from '@/src/modules/category/category.routes';

export async function POST(request: Request) {
  return categoryController.handleCreateCategory(request);
}
