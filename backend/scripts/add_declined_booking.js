const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addDeclinedBooking() {
  const vendor = await prisma.vendor.findFirst({
    where: {
      business: { nameEn: { contains: 'Aai', mode: 'insensitive' } }
    },
    include: { business: true }
  });

  const user = await prisma.user.findFirst({ where: { role: 'resident' } });
  const service = await prisma.vendorService.findFirst({ where: { businessId: vendor.business.id } });

  const existingDeclined = await prisma.booking.findFirst({
    where: { vendorId: vendor.id, status: 'declined' }
  });

  if (!existingDeclined && vendor && user && service) {
    const declined = await prisma.booking.create({
      data: {
        vendorId: vendor.id,
        userId: user.id,
        serviceId: service.id,
        price: 850,
        bookingDate: '2026-10-18',
        bookingTime: '06:00 PM',
        notes: 'Urgent 2kg birthday cake needed in 2 hours. Vendor kitchen at full capacity.',
        status: 'declined',
        paymentStatus: 'refunded',
        paymentMethod: 'upi',
        transactionId: 'UPI-REFUND-88192'
      }
    });
    console.log('Sample declined booking created:', declined.id);
  } else {
    console.log('Declined booking already exists');
  }
}

addDeclinedBooking()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
