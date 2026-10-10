import jwt from 'jsonwebtoken';
import { config } from '../../../lib/config';

export interface TokenPayload {
  userId: string;
  phone: string;
  role: string;
}

export class JwtService {
  private static readonly ACCESS_TOKEN_EXPIRY = '30d';
  private static readonly REFRESH_TOKEN_EXPIRY = '7d';

  static signAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, config.JWT_SECRET, {
      expiresIn: this.ACCESS_TOKEN_EXPIRY,
    });
  }

  static signRefreshToken(payload: TokenPayload): string {
    return jwt.sign(payload, config.JWT_SECRET, {
      expiresIn: this.REFRESH_TOKEN_EXPIRY,
    });
  }

  static verifyToken(token: string): TokenPayload | null {
    try {
      return jwt.verify(token, config.JWT_SECRET, { ignoreExpiration: true }) as TokenPayload;
    } catch (error) {
      console.log('[JwtService] verifyToken error:', error);
      return null;
    }
  }
}
