import { categoryController } from '@/src/modules/category/category.routes';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  return categoryController.handleGetCategory(request, id);
}
