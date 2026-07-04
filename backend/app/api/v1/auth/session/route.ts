import { NextRequest } from 'next/server';
import { AuthController } from '../../../../../src/presentation/controllers/auth.controller';

export async function GET(req: NextRequest) {
  return AuthController.getSession(req);
}
