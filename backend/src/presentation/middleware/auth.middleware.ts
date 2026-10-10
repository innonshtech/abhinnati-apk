import { NextRequest } from 'next/server';
import { JwtService, TokenPayload } from '../../infrastructure/security/jwt.service';
import { PrismaUserRepository } from '../../infrastructure/repositories/prisma-user.repository';
import { UnauthorizedError, ForbiddenError } from '../utils/response';

export class AuthMiddleware {
  private static userRepo = new PrismaUserRepository();

  static async authenticate(req: NextRequest): Promise<TokenPayload> {
    // 1. Extract auth header
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('[AuthMiddleware] Missing or malformed Authorization header');
      throw new UnauthorizedError('Missing or malformed Authorization header');
    }

    const token = authHeader.split(' ')[1];

    // 2. Verify JWT signature
    const payload = JwtService.verifyToken(token);
    if (!payload) {
      console.log('[AuthMiddleware] Invalid access token, verification failed');
      throw new UnauthorizedError('Invalid access token');
    }

    // 3. Confirm user is active and exists
    const user = await this.userRepo.findById(payload.userId);
    if (!user || !user.isActive) {
      console.log('[AuthMiddleware] User inactive or not found for userId:', payload.userId);
      throw new UnauthorizedError('User inactive or not found');
    }

    return {
      userId: user.id,
      phone: user.phone,
      role: user.role,
    };
  }

  static async authorize(req: NextRequest, allowedRoles: string[]): Promise<TokenPayload> {
    const userPayload = await this.authenticate(req);

    if (!allowedRoles.includes(userPayload.role)) {
      throw new ForbiddenError('Insufficient permissions for this action');
    }

    return userPayload;
  }
}
