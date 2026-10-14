const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedBooking() {
  const vendor = await prisma.vendor.findFirst({ include: { business: true } });
  const user = await prisma.user.findFirst({ where: { role: 'resident' } });

  if (!vendor || !user) {
    console.log('Vendor or user not found');
    return;
  }

  let service = await prisma.vendorService.findFirst();
  if (!service && vendor.business) {
    service = await prisma.vendorService.create({
      data: {
        businessId: vendor.business.id,
        nameEn: 'Full Home Deep Cleaning',
        nameMr: 'घर संपूर्ण स्वच्छता',
        price: 1499,
        durationMins: 120,
        descriptionEn: 'Complete 2BHK sanitized deep cleaning with high pressure tools',
        descriptionMr: 'दोन खोल्यांची संपूर्ण स्वच्छता'
      }
    });
  }

  const existingBooking = await prisma.booking.findFirst();
  if (!existingBooking) {
    const booking1 = await prisma.booking.create({
      data: {
        vendorId: vendor.id,
        userId: user.id,
        serviceId: service ? service.id : null,
        price: 1499,
        bookingDate: '2026-10-15',
        bookingTime: '10:30 AM',
        notes: 'Please bring ladder and sanitized cleaning equipment.',
        status: 'accepted',
        paymentStatus: 'paid',
        paymentMethod: 'upi',
        transactionId: 'UPI-MH-99201928'
      }
    });

    const booking2 = await prisma.booking.create({
      data: {
        vendorId: vendor.id,
        userId: user.id,
        serviceId: service ? service.id : null,
        price: 799,
        bookingDate: '2026-10-16',
        bookingTime: '02:00 PM',
        notes: 'Bathroom leak repair.',
        status: 'pending',
        paymentStatus: 'pending',
        paymentMethod: 'cod'
      }
    });

    console.log('Sample bookings created:', booking1.id, booking2.id);
  } else {
    console.log('Bookings already exist');
  }
}

seedBooking()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
