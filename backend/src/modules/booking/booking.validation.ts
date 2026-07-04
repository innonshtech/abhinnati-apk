import { z } from 'zod';

export const createBookingSchema = z.object({
  vendorId: z.string().min(1),
  vendorName: z.string().min(1),
  serviceId: z.string().min(1),
  serviceName: z.string().min(1),
  price: z.number().min(0),
  bookingDate: z.string().min(1),
  bookingTime: z.string().min(1),
  notes: z.string().optional(),
  paymentMethod: z.enum(['upi', 'card', 'cod']),
});

export const updateBookingSchema = z.object({
  status: z.enum(['pending', 'accepted', 'declined', 'completed', 'cancelled']).optional(),
  trackingStatus: z.enum(['ordered', 'en_route', 'in_progress', 'completed']).optional(),
});

export const createReviewSchema = z.object({
  rating: z.number().min(1).max(5),
  text: z.string().min(1),
});
