import { authController } from '@/src/modules/auth/auth.routes';

export async function POST(request: Request) {
  return authController.handleVerifyOtp(request);
}
