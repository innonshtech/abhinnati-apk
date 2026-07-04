import { NextResponse } from 'next/server';
import { verifyAuth, requireRole } from '@/lib/auth';
import { VendorService } from './vendor.service';
import { kycSchema, serviceSchema, reviewReplySchema } from './vendor.validation';

export class VendorController {
  private vendorService = new VendorService();

  async handleKyc(request: Request) {
    try {
      const user = await verifyAuth(request);
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      // KYC registration can be initiated by residents
      requireRole(user, ['resident', 'vendor', 'admin']);

      const body = await request.json();
      const result = kycSchema.safeParse(body);
      if (!result.success) {
        return NextResponse.json({ error: 'Invalid KYC data', details: result.error.issues }, { status: 400 });
      }

      const data = await this.vendorService.registerKyc(user.id, result.data);
      return NextResponse.json(data);
    } catch (error: any) {
      console.error('[VendorController] handleKyc error:', error);
      const status = error?.message?.includes('Forbidden') ? 403 : 500;
      return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status });
    }
  }

  async handleGetProfile(request: Request) {
    try {
      const user = await verifyAuth(request);
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      requireRole(user, ['vendor', 'admin']);

      const data = await this.vendorService.getVendorProfile(user.id);
      return NextResponse.json(data);
    } catch (error: any) {
      console.error('[VendorController] handleGetProfile error:', error);
      const message = error?.message || '';
      const status = message.includes('Forbidden') ? 403 : message.includes('not found') ? 404 : 500;
      return NextResponse.json({ error: message || 'Internal Server Error' }, { status });
    }
  }

  async handleSaveService(request: Request) {
    try {
      const user = await verifyAuth(request);
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      requireRole(user, ['vendor', 'admin']);

      const body = await request.json();
      const result = serviceSchema.safeParse(body);
      if (!result.success) {
        return NextResponse.json({ error: 'Invalid service data', details: result.error.issues }, { status: 400 });
      }

      const data = await this.vendorService.saveService(user.id, result.data);
      return NextResponse.json(data);
    } catch (error: any) {
      console.error('[VendorController] handleSaveService error:', error);
      const message = error?.message || '';
      const status = message.includes('Forbidden') ? 403 : message.includes('not found') ? 404 : 500;
      return NextResponse.json({ error: message || 'Internal Server Error' }, { status });
    }
  }

  async handleDeleteService(request: Request, serviceId: string) {
    try {
      const user = await verifyAuth(request);
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      requireRole(user, ['vendor', 'admin']);

      const data = await this.vendorService.deleteService(user.id, serviceId);
      return NextResponse.json(data);
    } catch (error: any) {
      console.error('[VendorController] handleDeleteService error:', error);
      const message = error?.message || '';
      const status = message.includes('Forbidden') ? 403 : message.includes('not found') ? 404 : 500;
      return NextResponse.json({ error: message || 'Internal Server Error' }, { status });
    }
  }

  async handleReplyReview(request: Request, reviewId: string) {
    try {
      const user = await verifyAuth(request);
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      requireRole(user, ['vendor', 'admin']);

      const body = await request.json();
      const result = reviewReplySchema.safeParse(body);
      if (!result.success) {
        return NextResponse.json({ error: 'Reply text is required', details: result.error.issues }, { status: 400 });
      }

      const data = await this.vendorService.replyToReview(user.id, reviewId, result.data.reply);
      return NextResponse.json(data);
    } catch (error: any) {
      console.error('[VendorController] handleReplyReview error:', error);
      const message = error?.message || '';
      const status = message.includes('Forbidden') ? 403 : message.includes('not found') ? 404 : 500;
      return NextResponse.json({ error: message || 'Internal Server Error' }, { status });
    }
  }

  async handleUpdateSetup(request: Request) {
    try {
      const user = await verifyAuth(request);
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      requireRole(user, ['vendor', 'admin']);

      const body = await request.json();
      const data = await this.vendorService.updateVendorProfileSetup(user.id, body);
      return NextResponse.json({ success: true, data });
    } catch (error: any) {
      console.error('[VendorController] handleUpdateSetup error:', error);
      return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
    }
  }

  async handleSkipSetup(request: Request) {
    try {
      const user = await verifyAuth(request);
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      requireRole(user, ['vendor', 'admin']);

      const data = await this.vendorService.skipFirstTimeSetup(user.id);
      return NextResponse.json({ success: true, data });
    } catch (error: any) {
      console.error('[VendorController] handleSkipSetup error:', error);
      return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
    }
  }

  async handleGetAvailability(request: Request) {
    try {
      const url = new URL(request.url);
      const vendorId = url.searchParams.get('vendorId');
      const date = url.searchParams.get('date');

      if (vendorId && date) {
        const data = await this.vendorService.getAvailableSlots(vendorId, date);
        return NextResponse.json({ success: true, data });
      }

      const user = await verifyAuth(request);
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      requireRole(user, ['vendor', 'admin']);

      const data = await this.vendorService.getVendorAvailability(user.id);
      return NextResponse.json({ success: true, data });
    } catch (error: any) {
      console.error('[VendorController] handleGetAvailability error:', error);
      return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
    }
  }

  async handleUpdateAvailability(request: Request) {
    try {
      const user = await verifyAuth(request);
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      requireRole(user, ['vendor', 'admin']);

      const body = await request.json();
      const data = await this.vendorService.updateVendorWeeklyHoursAndRadius(user.id, body);
      return NextResponse.json({ success: true, data });
    } catch (error: any) {
      console.error('[VendorController] handleUpdateAvailability error:', error);
      return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
    }
  }

  async handleUpdateVacation(request: Request) {
    try {
      const user = await verifyAuth(request);
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      requireRole(user, ['vendor', 'admin']);

      const body = await request.json();
      const data = await this.vendorService.updateVendorVacation(user.id, body);
      return NextResponse.json({ success: true, data });
    } catch (error: any) {
      console.error('[VendorController] handleUpdateVacation error:', error);
      return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
    }
  }

  async handleBlockDate(request: Request) {
    try {
      const user = await verifyAuth(request);
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      requireRole(user, ['vendor', 'admin']);

      const body = await request.json();
      const data = await this.vendorService.blockDate(user.id, body.date, body.reason);
      return NextResponse.json({ success: true, data });
    } catch (error: any) {
      console.error('[VendorController] handleBlockDate error:', error);
      return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
    }
  }

  async handleUnblockDate(request: Request) {
    try {
      const user = await verifyAuth(request);
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      requireRole(user, ['vendor', 'admin']);

      const body = await request.json();
      const data = await this.vendorService.unblockDate(user.id, body.date);
      return NextResponse.json({ success: true, data });
    } catch (error: any) {
      console.error('[VendorController] handleUnblockDate error:', error);
      return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
    }
  }

  async handleBlockSlot(request: Request) {
    try {
      const user = await verifyAuth(request);
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      requireRole(user, ['vendor', 'admin']);

      const body = await request.json();
      const data = await this.vendorService.blockSlot(user.id, body.date, body.startTime, body.endTime, body.reason);
      return NextResponse.json({ success: true, data });
    } catch (error: any) {
      console.error('[VendorController] handleBlockSlot error:', error);
      return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
    }
  }

  async handleUnblockSlot(request: Request) {
    try {
      const user = await verifyAuth(request);
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      requireRole(user, ['vendor', 'admin']);

      const body = await request.json();
      const data = await this.vendorService.unblockSlot(user.id, body.date, body.startTime, body.endTime);
      return NextResponse.json({ success: true, data });
    } catch (error: any) {
      console.error('[VendorController] handleUnblockSlot error:', error);
      return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
    }
  }

  async handleGetReviews(request: Request) {
    try {
      const user = await verifyAuth(request);
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      requireRole(user, ['vendor', 'admin']);

      const url = new URL(request.url);
      const page = parseInt(url.searchParams.get('page') || '1', 10);
      const limit = parseInt(url.searchParams.get('limit') || '10', 10);

      const data = await this.vendorService.getVendorReviews(user.id, page, limit);
      return NextResponse.json({ success: true, ...data });
    } catch (error: any) {
      console.error('[VendorController] handleGetReviews error:', error);
      return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
    }
  }

  async handleGetReviewById(request: Request, reviewId: string) {
    try {
      const user = await verifyAuth(request);
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      requireRole(user, ['vendor', 'admin']);

      const data = await this.vendorService.getReviewById(user.id, reviewId);
      return NextResponse.json({ success: true, data });
    } catch (error: any) {
      console.error('[VendorController] handleGetReviewById error:', error);
      return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
    }
  }

  async handleGetNotifications(request: Request) {
    try {
      const user = await verifyAuth(request);
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      requireRole(user, ['vendor', 'admin']);

      const data = await this.vendorService.getVendorNotifications(user.id);
      return NextResponse.json({ success: true, data });
    } catch (error: any) {
      console.error('[VendorController] handleGetNotifications error:', error);
      return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
    }
  }
}
