const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedPosts() {
  const user = await prisma.user.findFirst({ where: { role: 'resident' } });
  if (!user) {
    console.log('No resident user found');
    return;
  }

  const post1 = await prisma.post.create({
    data: {
      authorId: user.id,
      authorName: user.name || 'Pooja Deshmukh',
      areaId: 'pune-kothrud',
      tag: 'neighbourhood',
      titleEn: 'Road maintenance work on DP Road this Saturday',
      titleMr: 'या शनिवारी डीपी रस्त्यावर दुरुस्तीचे काम',
      contentEn: 'Traffic diversion expected between 10 AM to 4 PM near Vanaz metro station. Plan accordingly.',
      contentMr: 'वनाझ मेट्रो स्टेशनजवळ सकाळी १० ते दुपारी ४ दरम्यान वाहतूक वळवण्यात येईल. कृपया नोंद घ्यावी.'
    }
  });

  const post2 = await prisma.post.create({
    data: {
      authorId: user.id,
      authorName: 'Ramesh Kulkarni',
      areaId: 'mumbai-bandra',
      tag: 'community',
      titleEn: 'Looking for a reliable plumber for urgent bathroom pipe fitting',
      titleMr: 'तातडीच्या कामासाठी चांगला प्लंबर हवा आहे',
      contentEn: 'Any verified local plumbers available in Bandra West? Please share contacts.',
      contentMr: 'वांद्रे पश्चिम भागात कोणी चांगला प्लंबर उपलब्ध आहे का? कृपया संपर्क द्या.'
    }
  });

  console.log('Sample posts created:', post1.id, post2.id);
}

seedPosts()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
