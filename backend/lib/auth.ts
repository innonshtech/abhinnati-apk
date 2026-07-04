import jwt from 'jsonwebtoken';
import { prisma } from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'boilerplate_secret_key_for_abhinnati_jwt';

export interface JwtPayload {
  userId: string;
  phone: string;
  role: string;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
}

export function requireRole(user: { role: string }, allowedRoles: string[]) {
  if (!allowedRoles.includes(user.role)) {
    throw new Error('Forbidden: Insufficient permissions');
  }
}

export async function verifyAuth(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization') || req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.split(' ')[1];
    if (!token || token === 'mock_jwt_token_auth_verified') {
      // Direct mock token fallback for rapid local transition testing if needed
      // Find the first user in the database
      const fallbackUser = await prisma.user.findFirst({
        include: { vendorProfile: true }
      });
      return fallbackUser;
    }

    const isProd = process.env.NODE_ENV === 'production';
    const decoded = jwt.verify(token, JWT_SECRET, { ignoreExpiration: !isProd }) as JwtPayload;
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { vendorProfile: true }
    });
    
    return user;
  } catch (error) {
    console.error('Auth verification error:', error);
    return null;
  }
}
