import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing database tables...');
  await prisma.auditLog.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.notificationPreference.deleteMany({});
  await prisma.deviceToken.deleteMany({});
  await prisma.refreshToken.deleteMany({});
  await prisma.location.deleteMany({});
  await prisma.businessHours.deleteMany({});
  await prisma.vendorService.deleteMany({});
  await prisma.business.deleteMany({});
  await prisma.vendor.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.subCategory.deleteMany({});
  await prisma.category.deleteMany({});

  console.log('Seeding categories and subcategories...');
  const categories = [
    { slug: 'food', nameMr: 'बेकरी, केक्स, मिष्टान्न', nameEn: 'Bakery, Cakes, Desserts', iconName: 'Utensils' },
    { slug: 'salon', nameMr: 'सलून आणि सौंदर्य', nameEn: 'Salon & Beauty', iconName: 'Scissors' },
    { slug: 'cleaning', nameMr: 'घर स्वच्छता', nameEn: 'Home Cleaning', iconName: 'Sparkles' },
    { slug: 'repairs', nameMr: 'उपकरण दुरुस्ती', nameEn: 'Appliance Repairs', iconName: 'Wrench' }
  ];

  for (const cat of categories) {
    const createdCat = await prisma.category.create({
      data: {
        slug: cat.slug,
        nameMr: cat.nameMr,
        nameEn: cat.nameEn,
        iconName: cat.iconName,
        isActive: true,
        displayOrder: 1,
      }
    });

    await prisma.subCategory.create({
      data: {
        categoryId: createdCat.id,
        slug: `${cat.slug}-general`,
        nameMr: `${cat.nameMr} - सामान्य`,
        nameEn: `${cat.nameEn} - General`,
        isActive: true,
      }
    });
  }

  console.log('Seeding default administrator user...');
  const adminPasswordHash = await bcrypt.hash('Admin@123', 10);
  await prisma.user.create({
    data: {
      phone: '9999999999',
      email: 'admin@abhinnati.com',
      passwordHash: adminPasswordHash,
      name: 'System Admin',
      role: 'admin',
      language: 'en',
    }
  });

  console.log('Seeding default resident and vendor users...');
  const residentPasswordHash = await bcrypt.hash('Resident@123', 10);
  await prisma.user.create({
    data: {
      phone: '9876543212',
      email: 'resident@abhinnati.com',
      passwordHash: residentPasswordHash,
      name: 'Sneha Patil',
      role: 'resident',
      language: 'en',
      notificationPreferences: {
        create: {
          bookingNotifications: true,
          communityNotifications: true,
          spotlightNotifications: true,
          systemNotifications: true,
        }
      }
    }
  });

  const vendorPasswordHash = await bcrypt.hash('Vendor@123', 10);
  const vendorUser = await prisma.user.create({
    data: {
      phone: '9867626610',
      email: 'aai.bakery@abhinnati.com',
      passwordHash: vendorPasswordHash,
      name: 'Aai’s Bakery Owner',
      role: 'vendor',
      language: 'mr',
      notificationPreferences: {
        create: {
          bookingNotifications: true,
          communityNotifications: true,
          spotlightNotifications: true,
          systemNotifications: true,
        }
      }
    }
  });

  const vendor = await prisma.vendor.create({
    data: {
      userId: vendorUser.id,
      kycStatus: 'approved',
      firstApprovedLogin: false,
    }
  });

  const business = await prisma.business.create({
    data: {
      vendorId: vendor.id,
      nameMr: 'आईची बेकरी',
      nameEn: "Aai's Bakery",
      descriptionMr: 'आम्ही दररोज ताजे केक्स, पेस्ट्री आणि चवदार बेकरी उत्पादने पुरवतो.',
      descriptionEn: 'We serve fresh cakes, pastries and delicious bakery items every day.',
      whatsappNumber: '9867626610',
      email: 'aai.bakery@abhinnati.com',
      serviceRadius: '5 km',
    }
  });

  await prisma.location.create({
    data: {
      businessId: business.id,
      latitude: 19.0605,
      longitude: 72.8290,
      formattedAddress: 'Hill Road, Bandra West, Mumbai, Maharashtra 400050',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400050',
      area: 'Bandra West',
    }
  });

  for (let i = 0; i < 7; i++) {
    await prisma.businessHours.create({
      data: {
        businessId: business.id,
        dayOfWeek: i,
        openTime: '09:00',
        closeTime: '21:00',
        isClosed: false,
      }
    });
  }

  await prisma.vendorService.create({
    data: {
      businessId: business.id,
      nameMr: 'सानुकूल केक ऑर्डर',
      nameEn: 'Custom cake order',
      price: 600.0,
      durationMins: 45,
      descriptionMr: 'वाढदिवस आणि विशेष प्रसंगांसाठी सानुकूल केक्स.',
      descriptionEn: 'Custom cakes for birthdays and special occasions.',
      isActive: true,
    }
  });

  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
