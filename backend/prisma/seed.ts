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
  await prisma.areaAlias.deleteMany({});
  await prisma.area.deleteMany({});

  console.log('Seeding categories and subcategories...');
  const categories = [
    { slug: 'food', nameMr: 'बेकरी, केक्स, मिष्टान्न', nameEn: 'Bakery, Cakes, Desserts', iconName: 'Utensils', requiresFssai: true },
    { slug: 'salon', nameMr: 'सलून आणि सौंदर्य', nameEn: 'Salon & Beauty', iconName: 'Scissors', requiresFssai: false },
    { slug: 'cleaning', nameMr: 'घर स्वच्छता', nameEn: 'Home Cleaning', iconName: 'Sparkles', requiresFssai: false },
    { slug: 'repairs', nameMr: 'उपकरण दुरुस्ती', nameEn: 'Appliance Repairs', iconName: 'Wrench', requiresFssai: false }
  ];

  const createdCategories: Record<string, string> = {};
  for (const [index, cat] of categories.entries()) {
    const createdCat = await prisma.category.create({
      data: {
        slug: cat.slug,
        nameMr: cat.nameMr,
        nameEn: cat.nameEn,
        iconName: cat.iconName,
        isActive: true,
        displayOrder: index + 1,
        requiresFssai: cat.requiresFssai,
      }
    });
    createdCategories[cat.slug] = createdCat.id;

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

  console.log('Seeding operational areas...');
  const areas = [
    { slug: 'bandra-west', nameEn: 'Bandra West', nameMr: 'वांद्रे पश्चिम', latitude: 19.0596, longitude: 72.8295, radiusKm: 3, city: 'Mumbai', pincode: '400050', state: 'Maharashtra' },
    { slug: 'bandra-east', nameEn: 'Bandra East', nameMr: 'वांद्रे पूर्व', latitude: 19.0620, longitude: 72.8464, radiusKm: 3, city: 'Mumbai', pincode: '400051', state: 'Maharashtra' },
    { slug: 'khar', nameEn: 'Khar', nameMr: 'खार', latitude: 19.0700, longitude: 72.8350, radiusKm: 3, city: 'Mumbai', pincode: '400052', state: 'Maharashtra' },
    { slug: 'santacruz', nameEn: 'Santacruz', nameMr: 'सांताक्रूझ', latitude: 19.0800, longitude: 72.8400, radiusKm: 3, city: 'Mumbai', pincode: '400054', state: 'Maharashtra' },
    { slug: 'kothrud', nameEn: 'Kothrud', nameMr: 'कोथरूड', latitude: 18.5074, longitude: 73.8077, radiusKm: 5, city: 'Pune', pincode: '411038', state: 'Maharashtra' },
    { slug: 'deccan-gymkhana', nameEn: 'Deccan Gymkhana', nameMr: 'डेक्कन जिमखाना', latitude: 18.5186, longitude: 73.8417, radiusKm: 4, city: 'Pune', pincode: '411004', state: 'Maharashtra' },
    { slug: 'baner', nameEn: 'Baner', nameMr: 'बाणेर', latitude: 18.5590, longitude: 73.7868, radiusKm: 4, city: 'Pune', pincode: '411045', state: 'Maharashtra' },
  ];
  const createdAreas: Record<string, string> = {};
  for (const area of areas) {
    const created = await prisma.area.create({
      data: {
        name: area.nameEn,
        nameEn: area.nameEn,
        nameMr: area.nameMr,
        slug: area.slug,
        pincode: area.pincode,
        city: area.city,
        state: area.state,
        country: 'India',
        latitude: area.latitude,
        longitude: area.longitude,
        radiusKm: area.radiusKm,
        isActive: true,
      },
    });
    createdAreas[area.slug] = created.id;
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
      categoryId: createdCategories.food,
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
      area: createdAreas['bandra-west'],
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
