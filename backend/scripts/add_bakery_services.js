const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addBakeryServices() {
  const business = await prisma.business.findFirst({
    where: {
      OR: [
        { nameEn: { contains: 'Aai', mode: 'insensitive' } },
        { nameMr: { contains: 'आई', mode: 'insensitive' } }
      ]
    }
  });

  if (!business) {
    console.log('Aai Bakery business not found');
    return;
  }

  console.log('Found business:', business.nameEn, business.id);

  const newServices = [
    {
      nameEn: 'Fresh Butter Cookies (500g)',
      nameMr: 'ताजी बटर बिस्किटे (५०० ग्रॅम)',
      price: 180,
      durationMins: 15,
      descriptionEn: 'Crispy handmade bakery butter cookies made with pure amul butter',
      descriptionMr: 'अमूल बटरपासून बनवलेली ताजी आणि कुरकुरीत बिस्किटे'
    },
    {
      nameEn: 'Chocolate Truffle Pastry',
      nameMr: 'चॉकलेट ट्रफल पेस्ट्री',
      price: 80,
      durationMins: 15,
      descriptionEn: 'Rich dark chocolate layered pastry with ganache glaze',
      descriptionMr: 'गडद चॉकलेट आणि गॅनाचेपासून बनवलेली मऊ पेस्ट्री'
    },
    {
      nameEn: 'Whole Wheat Brown Bread',
      nameMr: 'ब्राउन ब्रेड (गव्हाचा ब्रेड)',
      price: 55,
      durationMins: 20,
      descriptionEn: '100% whole wheat healthy daily breakfast bread loaf',
      descriptionMr: 'आरोग्यदायी १००% गव्हाचा ताजा ब्रेड'
    },
    {
      nameEn: 'Birthday Celebration Cake (1 Kg)',
      nameMr: 'वाढदिवसाचा खास केक (१ किलो)',
      price: 850,
      durationMins: 60,
      descriptionEn: 'Customized cream cake with personalized message and photo icing option',
      descriptionMr: 'सानुकूल संदेश आणि फोटो आइसिंगसह १ किलोचा केक'
    },
    {
      nameEn: 'Veg Masala Puff / Patties',
      nameMr: 'व्हेज मसाला पफ / पॅटीस',
      price: 35,
      durationMins: 15,
      descriptionEn: 'Flaky baked pastry filled with spicy aloo and green peas masala',
      descriptionMr: 'मसालेदार बटाटा आणि मटार भरलेले गरम पॅटीस'
    }
  ];

  for (const s of newServices) {
    const existing = await prisma.vendorService.findFirst({
      where: {
        businessId: business.id,
        nameEn: s.nameEn
      }
    });

    if (!existing) {
      await prisma.vendorService.create({
        data: {
          businessId: business.id,
          nameEn: s.nameEn,
          nameMr: s.nameMr,
          price: s.price,
          durationMins: s.durationMins,
          descriptionEn: s.descriptionEn,
          descriptionMr: s.descriptionMr,
          isActive: true
        }
      });
      console.log('Created service:', s.nameEn);
    } else {
      console.log('Already exists:', s.nameEn);
    }
  }

  const allServices = await prisma.vendorService.findMany({ where: { businessId: business.id } });
  console.log('Total services now for ' + business.nameEn + ':', allServices.length);
}

addBakeryServices()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
