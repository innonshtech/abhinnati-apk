export function mapBookingForClient(
  b: any,
  fallbackUser?: { name?: string | null; phone?: string | null }
) {
  const nameEn = b.vendor?.business?.nameEn || b.vendor?.business?.nameMr || 'Vendor';
  const nameMr = b.vendor?.business?.nameMr || nameEn;
  const serviceEn = b.service?.nameEn || b.service?.nameMr || 'Service';
  const serviceMr = b.service?.nameMr || serviceEn;
  const createdAt = b.createdAt instanceof Date ? b.createdAt.toISOString() : b.createdAt;
  const cancelUntil =
    b.cancelUntil instanceof Date ? b.cancelUntil.toISOString() : b.cancelUntil || undefined;

  return {
    id: b.id,
    userId: b.userId || '',
    userName: b.user?.name || fallbackUser?.name || 'Customer',
    userPhone: b.user?.phone || fallbackUser?.phone || '',
    vendorId: b.vendorId,
    vendorName: nameEn,
    vendorNameEn: nameEn,
    vendorNameMr: nameMr,
    vendorPhone: b.vendor?.user?.phone || b.vendor?.business?.whatsappNumber || '',
    vendorWhatsapp: b.vendor?.business?.whatsappNumber || '',
    formattedAddress: b.vendor?.business?.locations?.[0]?.formattedAddress || '',
    serviceId: b.serviceId || '',
    serviceName: serviceEn,
    serviceNameEn: serviceEn,
    serviceNameMr: serviceMr,
    price: b.price || 0,
    bookingDate: b.bookingDate,
    bookingTime: b.bookingTime,
    notes: b.notes || undefined,
    status: b.status,
    paymentStatus: b.paymentStatus,
    paymentMethod: b.paymentMethod,
    transactionId: b.transactionId || undefined,
    createdAt,
    cancelUntil,
    trackingStatus: b.trackingStatus,
  };
}

export const bookingDetailInclude = {
  vendor: { include: { user: true, business: true } },
  user: true,
  service: true,
} as const;
