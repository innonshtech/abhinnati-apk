import { BookingRepository } from './booking.repository';
import { VendorService } from '../vendor/vendor.service';

export class BookingService {
  private bookingRepository = new BookingRepository();

  async getBookings(userId: string, vendorIdParam: string | null, userIdParam: string | null) {
    let whereClause: any = {};
    if (vendorIdParam) {
      whereClause.vendorId = vendorIdParam;
    } else if (userIdParam) {
      whereClause.userId = userIdParam;
    } else {
      whereClause.userId = userId;
    }

    return this.bookingRepository.findBookings(whereClause);
  }

  async createBooking(userId: string, userName: string, userPhone: string, data: any) {
    const vendorService = new VendorService();
    const availableSlots = await vendorService.getAvailableSlots(data.vendorId, data.bookingDate);
    
    const requestedTime = data.bookingTime.trim();
    const isAvailable = availableSlots.some(slot => {
      const cleanSlot = slot.time.trim();
      const cleanRequested = requestedTime.replace('AM', '').replace('PM', '').trim();
      return (cleanSlot === cleanRequested || slot.time === requestedTime) && slot.available;
    });

    if (!isAvailable) {
      throw new Error('Selected date or time slot is no longer available. Please choose another time.');
    }

    const booking = await this.bookingRepository.createBooking({
      userId: userId,
      userName: userName || 'Resident',
      userPhone: userPhone,
      vendorId: data.vendorId,
      vendorName: data.vendorName,
      serviceId: data.serviceId,
      serviceName: data.serviceName,
      price: data.price,
      bookingDate: data.bookingDate,
      bookingTime: data.bookingTime,
      notes: data.notes || '',
      status: 'pending',
      paymentStatus: data.paymentMethod === 'cod' ? 'pending' : 'paid',
      paymentMethod: data.paymentMethod,
      trackingStatus: 'ordered',
    });

    const vendor = await this.bookingRepository.findVendorById(data.vendorId);
    if (vendor) {
      await this.bookingRepository.createNotification({
        userId: vendor.userId,
        title_mr: 'नवीन बुकिंग विनंती',
        title_en: 'New Booking Request',
        message_mr: `${userName || 'रहिवासी'} कडून '${data.serviceName}' साठी नवीन बुकिंग विनंती प्राप्त झाली आहे.`,
        message_en: `Received a new booking request for '${data.serviceName}' from ${userName || 'Resident'}.`,
        type: 'booking',
        read: false,
      });
    }

    return booking;
  }

  async updateBooking(userId: string, bookingId: string, data: any) {
    const booking = await this.bookingRepository.findBookingById(bookingId);
    if (!booking) {
      throw new Error('Booking not found');
    }

    const { status, trackingStatus } = data;

    const updateData: any = {};
    if (status) updateData.status = status;
    if (trackingStatus) updateData.trackingStatus = trackingStatus;

    if (status === 'completed') {
      updateData.paymentStatus = 'paid';
      updateData.trackingStatus = 'completed';
    }

    const updatedBooking = await this.bookingRepository.updateBooking(bookingId, updateData);

    // Create notifications for status updates
    if (status && status !== booking.status) {
      let titleMr = 'बुकिंग अपडेट';
      let titleEn = 'Booking Update';
      let messageMr = `तुमच्या बुकिंगचा दर्जा बदलून ${status} झाला आहे.`;
      let messageEn = `Your booking status has been updated to ${status}.`;

      if (status === 'accepted') {
        titleMr = 'बुकिंग मंजूर';
        titleEn = 'Booking Accepted';
        messageMr = `${booking.vendorName} यांनी तुमची बुकिंग स्वीकारली आहे.`;
        messageEn = `${booking.vendorName} has accepted your booking request.`;
      } else if (status === 'declined') {
        titleMr = 'बुकिंग नाकारली';
        titleEn = 'Booking Declined';
        messageMr = `${booking.vendorName} यांनी तुमची बुकिंग नाकारली आहे.`;
        messageEn = `${booking.vendorName} has declined your booking request.`;
      } else if (status === 'completed') {
        titleMr = 'बुकिंग पूर्ण झाली';
        titleEn = 'Booking Completed';
        messageMr = `तुमचे काम यशस्वीरित्या पूर्ण झाले आहे. कृपया अभिप्राय द्या!`;
        messageEn = `Your service has been successfully completed. Please leave a review!`;
      }

      await this.bookingRepository.createNotification({
        userId: booking.userId,
        title_mr: titleMr,
        title_en: titleEn,
        message_mr: messageMr,
        message_en: messageEn,
        type: 'booking',
        read: false,
      });
    }

    // Create notifications for tracking status updates
    if (trackingStatus && trackingStatus !== booking.trackingStatus && (!status || status === booking.status)) {
      let titleMr = 'कौटुंबिक ट्रॅकिंग अपडेट';
      let titleEn = 'Tracking Update';
      let messageMr = `व्यवसायिक सध्या आपल्या सेवेसाठी प्रगतीवर आहेत.`;
      let messageEn = `Vendor progress is updated.`;

      if (trackingStatus === 'en_route') {
        titleMr = 'व्यवसायिक निघाले आहेत';
        titleEn = 'Provider En Route';
        messageMr = `${booking.vendorName} आपल्या पत्त्यावर येण्यास निघाले आहेत.`;
        messageEn = `${booking.vendorName} is on the way to your location.`;
      } else if (trackingStatus === 'in_progress') {
        titleMr = 'काम सुरू झाले आहे';
        titleEn = 'Work Started';
        messageMr = `${booking.vendorName} यांनी प्रत्यक्ष काम सुरू केले आहे.`;
        messageEn = `${booking.vendorName} has started the service job.`;
      }

      await this.bookingRepository.createNotification({
        userId: booking.userId,
        title_mr: titleMr,
        title_en: titleEn,
        message_mr: messageMr,
        message_en: messageEn,
        type: 'booking',
        read: false,
      });
    }

    return updatedBooking;
  }

  async createReview(userId: string, userName: string, bookingId: string, data: any) {
    const booking = await this.bookingRepository.findBookingById(bookingId);
    if (!booking) {
      throw new Error('Booking not found');
    }

    const { rating, text } = data;

    const review = await this.bookingRepository.createReview({
      vendorId: booking.vendorId,
      userId: userId,
      userName: userName || 'Resident',
      rating,
      text,
    });

    const allReviews = await this.bookingRepository.findReviewsByVendorId(booking.vendorId);
    const reviewsCount = allReviews.length;
    const totalRatingSum = allReviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0);
    const ratingAvg = Math.round((totalRatingSum / reviewsCount) * 10) / 10;

    await this.bookingRepository.updateVendorStats(booking.vendorId, ratingAvg, reviewsCount);

    const vendor = await this.bookingRepository.findVendorById(booking.vendorId);
    if (vendor) {
      await this.bookingRepository.createNotification({
        userId: vendor.userId,
        title_mr: 'नवीन पुनरावलोकन',
        title_en: 'New Review Received',
        message_mr: `${userName || 'रहिवासी'} कडून ${rating}⭐ रेटिंगसह नवीन पुनरावलोकन प्राप्त झाले आहे.`,
        message_en: `Received a new ${rating}⭐ review from ${userName || 'Resident'}.`,
        type: 'review',
        referenceId: review.id,
      });
    }

    return review;
  }
}
