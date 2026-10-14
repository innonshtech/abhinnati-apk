import { categoryController } from '@/src/modules/category/category.routes';

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  return categoryController.handleUpdateCategory(request, id);
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  return categoryController.handleDeleteCategory(request, id);
}
