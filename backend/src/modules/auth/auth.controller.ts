import { NextResponse } from 'next/server';
import { AuthService } from './auth.service';
import { requestOtpSchema, verifyOtpSchema, refreshSchema } from './auth.validation';

export class AuthController {
  private authService = new AuthService();

  async handleRequestOtp(request: Request) {
    try {
      const body = await request.json();
      const result = requestOtpSchema.safeParse(body);

      if (!result.success) {
        return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 });
      }

      const { phone_number } = result.data;
      const data = await this.authService.requestOtp(phone_number);
      return NextResponse.json(data);
    } catch (error: any) {
      console.error('[AuthController] requestOtp error:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }

  async handleVerifyOtp(request: Request) {
    try {
      const body = await request.json();
      const result = verifyOtpSchema.safeParse(body);

      if (!result.success) {
        return NextResponse.json({ error: 'Session ID and Code are required' }, { status: 400 });
      }

      const { session_id, code } = result.data;
      const data = await this.authService.verifyOtp(session_id, code);
      return NextResponse.json(data);
    } catch (error: any) {
      console.error('[AuthController] verifyOtp error:', error);
      const message = error?.message || 'Internal Server Error';
      const status = (message.includes('Invalid') || message.includes('Incorrect') || message.includes('expired')) ? 400 : 500;
      return NextResponse.json({ error: message }, { status });
    }
  }

  async handleRefresh(request: Request) {
    try {
      const body = await request.json();
      const result = refreshSchema.safeParse(body);

      if (!result.success) {
        return NextResponse.json({ error: 'Refresh token is required' }, { status: 400 });
      }

      const { refreshToken } = result.data;
      const data = await this.authService.refreshAccessToken(refreshToken);
      return NextResponse.json(data);
    } catch (error: any) {
      console.error('[AuthController] handleRefresh error:', error);
      const message = error?.message || 'Internal Server Error';
      const status = (message.includes('Invalid') || message.includes('expired')) ? 400 : 500;
      return NextResponse.json({ error: message }, { status });
    }
  }
}
