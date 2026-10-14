import { userController } from '@/src/modules/user/user.routes';

export async function PATCH(request: Request) {
  return userController.handleUpdateProfile(request);
}

export async function POST(request: Request) {
  return userController.handleCreateProfile(request);
}
