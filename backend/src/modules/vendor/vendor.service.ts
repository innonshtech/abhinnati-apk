import { VendorRepository } from './vendor.repository';
import { storageService } from '@/lib/storage';
import { prisma } from '@/lib/prisma';
import { mapVendorForClient, resolveCategory } from '@/lib/catalog';

export class VendorService {
  private vendorRepository = new VendorRepository();

  async registerKyc(userId: string, data: any) {
    const existing = await this.vendorRepository.findVendorByUserId(userId);
    if (existing) {
      throw new Error('Vendor profile already exists');
    }

    const docs = data.kycDocs || {};
    if (!docs.aadhaar) {
      throw new Error('Aadhaar card upload is mandatory');
    }

    // Process document uploads dynamically for future readiness
    const kycDocsUrlMap: Record<string, string> = {};
    for (const [docKey, docVal] of Object.entries(docs) as [string, any][]) {
      if (docVal.fileData) {
        const ext = docVal.mimeType === 'application/pdf' ? 'pdf' : 'png';
        const uniqueFilename = `kyc_${userId}_${docKey}_${Date.now()}.${ext}`;
        
        const fileUrl = await storageService.uploadFile(
          'kyc-docs',
          uniqueFilename,
          docVal.fileData,
          docVal.mimeType
        );
        kycDocsUrlMap[docKey] = fileUrl;
      }
    }

    // Ensure Aadhaar was successfully uploaded
    if (!kycDocsUrlMap.aadhaar) {
      throw new Error('Aadhaar card upload failed or file data is invalid');
    }

    const category = await resolveCategory(data.categoryId || data.categorySlug);
    const vendor = await this.vendorRepository.createVendor({
      userId: userId,
      kycStatus: 'pending',
      kycDocsUrl: JSON.stringify(kycDocsUrlMap),
    });
    await prisma.business.create({
      data: {
        vendorId: vendor.id,
        nameMr: data.businessNameMr || data.businessNameEn || '',
        nameEn: data.businessNameEn || '',
        descriptionMr: data.descriptionMr || '',
        descriptionEn: data.descriptionEn || '',
        categoryId: category?.id,
      },
    });

    await this.vendorRepository.updateUserRole(userId, 'vendor');
    return vendor;
  }

  async getVendorProfile(userId: string) {
    const vendor = await this.vendorRepository.findVendorByUserId(userId);
    if (!vendor) {
      throw new Error('Vendor profile not found');
    }
    return mapVendorForClient(vendor);
  }

  async saveService(userId: string, data: any) {
    const vendor = await this.vendorRepository.findVendorByUserId(userId);
    if (!vendor) {
      throw new Error('Vendor profile not found');
    }

    if (data.id) {
      const existing = await this.vendorRepository.findServiceById(data.id);
      if (!existing || existing.businessId !== vendor.business?.id) {
        throw new Error('Forbidden');
      }

      return this.vendorRepository.updateService(data.id, {
        nameMr: data.name_mr || data.nameMr,
        nameEn: data.name_en || data.nameEn,
        price: data.price,
        durationMins: data.duration_mins || data.durationMins,
        descriptionMr: data.description_mr || data.descriptionMr,
        descriptionEn: data.description_en || data.descriptionEn,
      });
    } else {
      if (!vendor.business) {
        throw new Error('Business profile required to create service');
      }
      return this.vendorRepository.createService({
        businessId: vendor.business.id,
        nameMr: data.name_mr || data.nameMr,
        nameEn: data.name_en || data.nameEn,
        price: data.price,
        durationMins: data.duration_mins || data.durationMins,
        descriptionMr: data.description_mr || data.descriptionMr,
        descriptionEn: data.description_en || data.descriptionEn,
      });
    }
  }

  async deleteService(userId: string, serviceId: string) {
    const vendor = await this.vendorRepository.findVendorByUserId(userId);
    if (!vendor) {
      throw new Error('Vendor profile not found');
    }

    const service = await this.vendorRepository.findServiceById(serviceId);
    if (!service) {
      throw new Error('Service not found');
    }

    if (service.businessId !== vendor.business?.id) {
      throw new Error('Forbidden');
    }

    await this.vendorRepository.deleteService(serviceId);
    return { success: true };
  }

  async replyToReview(userId: string, reviewId: string, reply: string) {
    const review = await this.vendorRepository.findReviewById(reviewId);
    if (!review) {
      throw new Error('Review not found');
    }

    if (review.business?.vendor?.userId !== userId) {
      throw new Error('Forbidden');
    }

    return this.vendorRepository.updateReviewReply(reviewId, reply);
  }

  async updateVendorProfileSetup(userId: string, data: any) {
    const vendor = await this.vendorRepository.findVendorByUserId(userId);
    if (!vendor) {
      throw new Error('Vendor profile not found');
    }

    const businessUpdate: any = {};

    if (data.businessNameEn !== undefined) businessUpdate.nameEn = data.businessNameEn;
    if (data.businessNameMr !== undefined) businessUpdate.nameMr = data.businessNameMr;
    if (data.descriptionEn !== undefined) businessUpdate.descriptionEn = data.descriptionEn;
    if (data.descriptionMr !== undefined) businessUpdate.descriptionMr = data.descriptionMr;
    if (data.whatsappNumber !== undefined) businessUpdate.whatsappNumber = data.whatsappNumber;
    if (data.email !== undefined) businessUpdate.email = data.email;
    if (data.categorySlug || data.categoryId) {
      const category = await resolveCategory(data.categoryId || data.categorySlug);
      if (category) businessUpdate.categoryId = category.id;
    }

    if (data.coverPhoto && data.coverPhoto.fileData) {
      const ext = data.coverPhoto.mimeType === 'image/png' ? 'png' : 'jpg';
      const filename = `vendor_${vendor.id}_cover_${Date.now()}.${ext}`;
      businessUpdate.coverPhotoUrl = await storageService.uploadFile(
        'vendor-assets',
        filename,
        data.coverPhoto.fileData,
        data.coverPhoto.mimeType
      );
    } else if (data.coverPhotoUrl !== undefined) {
      businessUpdate.coverPhotoUrl = data.coverPhotoUrl;
    }

    if (data.logo && data.logo.fileData) {
      const ext = data.logo.mimeType === 'image/png' ? 'png' : 'jpg';
      const filename = `vendor_${vendor.id}_logo_${Date.now()}.${ext}`;
      businessUpdate.logoUrl = await storageService.uploadFile(
        'vendor-assets',
        filename,
        data.logo.fileData,
        data.logo.mimeType
      );
    } else if (data.logoUrl !== undefined) {
      businessUpdate.logoUrl = data.logoUrl;
    }

    if (data.gallery) {
      const galleryUrlsList: string[] = [];
      for (let i = 0; i < data.gallery.length; i++) {
        const item = data.gallery[i];
        if (item.fileData) {
          const ext = item.mimeType === 'image/png' ? 'png' : 'jpg';
          const filename = `vendor_${vendor.id}_gallery_${i}_${Date.now()}.${ext}`;
          const url = await storageService.uploadFile(
            'vendor-assets',
            filename,
            item.fileData,
            item.mimeType
          );
          galleryUrlsList.push(url);
        } else if (typeof item === 'string') {
          galleryUrlsList.push(item);
        } else if (item.url) {
          galleryUrlsList.push(item.url);
        }
      }
      businessUpdate.galleryUrls = JSON.stringify(galleryUrlsList);
    }

    if (vendor.business) {
      if (Object.keys(businessUpdate).length > 0) {
        await prisma.business.update({
          where: { id: vendor.business.id },
          data: businessUpdate,
        });
      }

      const hasLocationUpdate =
        data.latitude !== undefined ||
        data.longitude !== undefined ||
        data.formattedAddress !== undefined ||
        data.city !== undefined ||
        data.state !== undefined ||
        data.pincode !== undefined ||
        data.areaId !== undefined;

      if (hasLocationUpdate) {
        const existingLoc = await prisma.location.findFirst({
          where: { businessId: vendor.business.id, deletedAt: null },
        });
        const locationData = {
          latitude: Number(data.latitude ?? existingLoc?.latitude ?? 0),
          longitude: Number(data.longitude ?? existingLoc?.longitude ?? 0),
          formattedAddress: data.formattedAddress ?? existingLoc?.formattedAddress ?? '',
          city: data.city ?? existingLoc?.city ?? '',
          state: data.state ?? existingLoc?.state ?? '',
          pincode: data.pincode ?? existingLoc?.pincode ?? '',
          area: data.areaId ?? data.area ?? existingLoc?.area ?? '',
        };
        if (existingLoc) {
          await prisma.location.update({ where: { id: existingLoc.id }, data: locationData });
        } else {
          await prisma.location.create({
            data: { businessId: vendor.business.id, ...locationData },
          });
        }
      }
    }

    await this.vendorRepository.updateVendor(userId, { firstApprovedLogin: false });
    const refreshed = await this.vendorRepository.findVendorByUserId(userId);
    return refreshed ? mapVendorForClient(refreshed) : null;
  }

  async skipFirstTimeSetup(userId: string) {
    return this.vendorRepository.updateVendor(userId, {
      firstApprovedLogin: false
    });
  }

  async getAvailableSlots(vendorId: string, dateStr: string) {
    const vendor = await prisma.vendor.findFirst({
      where: {
        OR: [
          { id: vendorId },
          { userId: vendorId }
        ]
      }
    });

    if (!vendor) {
      throw new Error('Vendor not found');
    }

    const defaultSlots = [
      { time: '10:00', available: true },
      { time: '12:30', available: true },
      { time: '4:00', available: true },
      { time: '5:30', available: true },
      { time: '6:00', available: true },
      { time: '7:30', available: true },
    ];

    // 1. Vacation Mode Guard
    if (vendor.vacationMode && vendor.vacationStart && vendor.vacationEnd) {
      const queryDate = new Date(dateStr + 'T00:00:00');
      const start = new Date(vendor.vacationStart);
      const end = new Date(vendor.vacationEnd);
      queryDate.setHours(0,0,0,0);
      start.setHours(0,0,0,0);
      end.setHours(0,0,0,0);
      if (queryDate >= start && queryDate <= end) {
        return defaultSlots.map(s => ({ ...s, available: false }));
      }
    }

    // 2. Blocked Dates Guard
    if (vendor.blockedDates) {
      try {
        const blockedDatesList = JSON.parse(vendor.blockedDates);
        if (blockedDatesList.some((item: any) => item.date === dateStr)) {
          return defaultSlots.map(s => ({ ...s, available: false }));
        }
      } catch (e) {
        console.error('Error parsing blockedDates:', e);
      }
    }

    // 3. Weekly Hours Guard
    const weekday = getWeekdayName(dateStr);
    let isDayClosed = false;
    let startMin = 9 * 60; // 9:00 AM
    let endMin = 18 * 60; // 6:00 PM

    if (vendor.weeklyHours) {
      try {
        const weeklyConfig = JSON.parse(vendor.weeklyHours);
        const dayConfig = weeklyConfig[weekday];
        if (dayConfig) {
          isDayClosed = !!dayConfig.closed;
          if (dayConfig.startTime) startMin = parseTimeToMinutes(dayConfig.startTime);
          if (dayConfig.endTime) endMin = parseTimeToMinutes(dayConfig.endTime);
        }
      } catch (e) {
        console.error('Error parsing weeklyHours:', e);
      }
    } else {
      if (weekday === 'Sunday') {
        isDayClosed = true;
      }
    }

    if (isDayClosed) {
      return defaultSlots.map(s => ({ ...s, available: false }));
    }

    // 4. Blocked slots lists
    let blockedSlotsList: any[] = [];
    if (vendor.blockedSlots) {
      try {
        blockedSlotsList = JSON.parse(vendor.blockedSlots).filter((item: any) => item.date === dateStr);
      } catch (e) {
        console.error('Error parsing blockedSlots:', e);
      }
    }

    // 5. Existing Bookings (Double Booking prevention)
    const activeBookings = await prisma.booking.findMany({
      where: {
        vendorId: vendor.id,
        bookingDate: dateStr,
        status: {
          in: ['pending', 'accepted', 'completed']
        }
      },
      select: {
        bookingTime: true
      }
    });

    const bookedTimes = activeBookings.map((b: any) => b.bookingTime.trim());

    return defaultSlots.map(slot => {
      const slotMin = parseTimeToMinutes(slot.time);
      
      if (slotMin < startMin || slotMin > endMin) {
        return { ...slot, available: false };
      }

      const isBlockedSlot = blockedSlotsList.some(bSlot => {
        const bStart = parseTimeToMinutes(bSlot.startTime);
        const bEnd = parseTimeToMinutes(bSlot.endTime);
        return slotMin >= bStart && slotMin <= bEnd;
      });
      if (isBlockedSlot) {
        return { ...slot, available: false };
      }

      const isBooked = bookedTimes.some((bTime: string) => {
        const cleanB = bTime.replace('AM', '').replace('PM', '').trim();
        const cleanSlot = slot.time.trim();
        return cleanB === cleanSlot || bTime === slot.time;
      });
      if (isBooked) {
        return { ...slot, available: false };
      }

      return slot;
    });
  }

  async getVendorAvailability(userId: string) {
    const vendor = await this.vendorRepository.findVendorByUserId(userId);
    if (!vendor) throw new Error('Vendor profile not found');
    return {
      weeklyHours: vendor.weeklyHours,
      vacationMode: vendor.vacationMode,
      vacationStart: vendor.vacationStart,
      vacationEnd: vendor.vacationEnd,
      vacationReason: vendor.vacationReason,
      blockedDates: vendor.blockedDates,
      blockedSlots: vendor.blockedSlots,
      serviceRadius: vendor.serviceRadius,
      emergencyStatus: vendor.emergencyStatus,
    };
  }

  async updateVendorWeeklyHoursAndRadius(userId: string, data: any) {
    const updateData: any = {};
    if (data.weeklyHours !== undefined) {
      updateData.weeklyHours = typeof data.weeklyHours === 'string' ? data.weeklyHours : JSON.stringify(data.weeklyHours);
    }
    if (data.serviceRadius !== undefined) {
      updateData.serviceRadius = data.serviceRadius;
    }
    if (data.emergencyStatus !== undefined) {
      updateData.emergencyStatus = data.emergencyStatus;
    }
    return this.vendorRepository.updateVendor(userId, updateData);
  }

  async updateVendorVacation(userId: string, data: any) {
    const isVacation = Boolean(data.vacationMode ?? data.isFullyBooked ?? true);
    const vacationStart = data.vacationStart ? new Date(data.vacationStart) : null;
    const vacationEnd = data.vacationEnd ? new Date(data.vacationEnd) : null;
    const vacationReason = data.vacationReason || null;

    const vendor = await this.vendorRepository.findVendorByUserId(userId);
    if (!vendor) throw new Error('Vendor profile not found');

    const updatedVendor = await this.vendorRepository.updateVendor(userId, {
      vacationMode: isVacation,
      vacationStart,
      vacationEnd,
      vacationReason,
    });

    if (vendor.business) {
      const { prisma } = require('../../../lib/prisma');
      await prisma.business.update({
        where: { id: vendor.business.id },
        data: {
          vacationMode: isVacation,
          vacationStart,
          vacationEnd,
          vacationReason,
        },
      });
    }

    return updatedVendor;
  }

  async blockDate(userId: string, date: string, reason?: string) {
    const vendor = await this.vendorRepository.findVendorByUserId(userId);
    if (!vendor) throw new Error('Vendor profile not found');

    let current = [];
    if (vendor.blockedDates) {
      try {
        current = JSON.parse(vendor.blockedDates);
      } catch {}
    }
    if (!current.some((item: any) => item.date === date)) {
      current.push({ date, reason });
    }
    return this.vendorRepository.updateVendor(userId, {
      blockedDates: JSON.stringify(current)
    });
  }

  async unblockDate(userId: string, date: string) {
    const vendor = await this.vendorRepository.findVendorByUserId(userId);
    if (!vendor) throw new Error('Vendor profile not found');

    let current = [];
    if (vendor.blockedDates) {
      try {
        current = JSON.parse(vendor.blockedDates);
      } catch {}
    }
    current = current.filter((item: any) => item.date !== date);
    return this.vendorRepository.updateVendor(userId, {
      blockedDates: JSON.stringify(current)
    });
  }

  async blockSlot(userId: string, date: string, startTime: string, endTime: string, reason?: string) {
    const vendor = await this.vendorRepository.findVendorByUserId(userId);
    if (!vendor) throw new Error('Vendor profile not found');

    let current = [];
    if (vendor.blockedSlots) {
      try {
        current = JSON.parse(vendor.blockedSlots);
      } catch {}
    }
    if (!current.some((item: any) => item.date === date && item.startTime === startTime && item.endTime === endTime)) {
      current.push({ date, startTime, endTime, reason });
    }
    return this.vendorRepository.updateVendor(userId, {
      blockedSlots: JSON.stringify(current)
    });
  }

  async unblockSlot(userId: string, date: string, startTime: string, endTime: string) {
    const vendor = await this.vendorRepository.findVendorByUserId(userId);
    if (!vendor) throw new Error('Vendor profile not found');

    let current = [];
    if (vendor.blockedSlots) {
      try {
        current = JSON.parse(vendor.blockedSlots);
      } catch {}
    }
    current = current.filter((item: any) => !(item.date === date && item.startTime === startTime && item.endTime === endTime));
    return this.vendorRepository.updateVendor(userId, {
      blockedSlots: JSON.stringify(current)
    });
  }

  async getVendorReviews(userId: string, page = 1, limit = 10) {
    const vendor = await this.vendorRepository.findVendorByUserId(userId);
    if (!vendor) throw new Error('Vendor profile not found');

    const skip = (page - 1) * limit;

    const businessId = vendor.business?.id;
    if (!businessId) {
      return { reviews: [], total: 0, repliedCount: 0, ratingAvg: 0, reviewsCount: 0, page, limit, totalPages: 0 };
    }

    const reviews = await prisma.review.findMany({
      where: { businessId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    const total = await prisma.review.count({
      where: { businessId }
    });

    const repliedCount = await prisma.review.count({
      where: {
        businessId,
        reply: { not: null }
      }
    });

    return {
      reviews,
      total,
      repliedCount,
      ratingAvg: vendor.ratingAvg,
      reviewsCount: vendor.reviewsCount,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async getReviewById(userId: string, reviewId: string) {
    const vendor = await this.vendorRepository.findVendorByUserId(userId);
    if (!vendor) throw new Error('Vendor profile not found');

    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) throw new Error('Review not found');
    if (review.businessId !== vendor.business?.id) throw new Error('Forbidden');

    return review;
  }

  async getVendorNotifications(userId: string) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  }
}

function getWeekdayName(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return weekdays[date.getDay()];
}

function parseTimeToMinutes(timeStr: string): number {
  const clean = timeStr.trim().toUpperCase();
  const isPm = clean.endsWith('PM');
  const isAm = clean.endsWith('AM');
  const timePart = clean.replace('AM', '').replace('PM', '').trim();
  
  const [hourStr, minStr] = timePart.split(':');
  let hour = parseInt(hourStr, 10);
  const minutes = parseInt(minStr || '0', 10);
  
  if (isPm && hour < 12) hour += 12;
  if (isAm && hour === 12) hour = 0;
  
  if (!isAm && !isPm && hour < 9) {
    hour += 12;
  }
  return hour * 60 + minutes;
}
