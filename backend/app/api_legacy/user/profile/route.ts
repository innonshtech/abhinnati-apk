import { userController } from '@/src/modules/user/user.routes';

export async function POST(request: Request) {
  return userController.handleCreateProfile(request);
}
