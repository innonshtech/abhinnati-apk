import { prisma } from './prisma';

export async function resolveCategory(slugOrId?: string | null) {
  if (!slugOrId) return null;
  return prisma.category.findFirst({
    where: {
      deletedAt: null,
      OR: [{ id: slugOrId }, { slug: slugOrId }],
    },
  });
}

export function toClientArea(area: {
  id: string;
  name?: string | null;
  nameEn?: string | null;
  nameMr?: string | null;
  latitude: number;
  longitude: number;
  radiusKm?: number | null;
  city?: string | null;
  pincode?: string | null;
  slug?: string | null;
}) {
  const nameEn = area.nameEn || area.name || '';
  const nameMr = area.nameMr || nameEn;
  return {
    id: area.id,
    name_en: nameEn,
    name_mr: nameMr,
    latitude: area.latitude,
    longitude: area.longitude,
    radius_km: area.radiusKm ?? 5,
    locality: nameEn,
    city: area.city || '',
    pincode: area.pincode || '',
    slug: area.slug || '',
  };
}

export function getAreaDelegate() {
  return (prisma as any).area;
}

export async function mapVendorsForClient(vendors: any[]) {
  let categories: any[] = [];
  try {
    categories = await prisma.category.findMany({
      where: { isActive: true, deletedAt: null },
    });
  } catch (error) {
    console.warn('[catalog] Category lookup skipped:', error);
  }
  const byId = new Map(categories.map((category) => [category.id, category]));
  const bySlug = new Map(categories.map((category) => [category.slug, category]));

  return vendors.map((vendor) => {
    const mapped = mapVendorForClient(vendor);
    const category =
      byId.get(vendor?.business?.categoryId) ||
      bySlug.get(mapped.categorySlug) ||
      vendor?.business?.category;
    if (category) {
      mapped.categoryId = category.id;
      mapped.categorySlug = category.slug;
      mapped.categoryNameMr = category.nameMr;
      mapped.categoryNameEn = category.nameEn;
    }
    return mapped;
  });
}

export function mapVendorForClient(vendor: any) {
  const business = vendor?.business;
  const location = business?.locations?.[0];
  const category = business?.category;
  const services = business?.services || vendor?.services || [];
  const reviews = business?.reviews || vendor?.reviews || [];

  return {
    id: vendor.id,
    userId: vendor.userId,
    businessNameMr: business?.nameMr || '',
    businessNameEn: business?.nameEn || '',
    categoryId: category?.id || business?.categoryId || null,
    categorySlug: category?.slug || '',
    categoryNameMr: category?.nameMr || '',
    categoryNameEn: category?.nameEn || '',
    descriptionMr: business?.descriptionMr || '',
    descriptionEn: business?.descriptionEn || '',
    latitude: location?.latitude ?? null,
    longitude: location?.longitude ?? null,
    areaId: location?.area || '',
    formattedAddress: location?.formattedAddress || '',
    city: location?.city || '',
    state: location?.state || '',
    pincode: location?.pincode || '',
    kycStatus: String(vendor.kycStatus || '').toLowerCase(),
    kycDocsUrl: vendor.kycDocsUrl,
    isFullyBooked: business?.vacationMode || vendor.vacationMode || false,
    ratingAvg: business?.ratingAvg ?? vendor.ratingAvg ?? 0,
    reviewsCount: business?.reviewsCount ?? vendor.reviewsCount ?? 0,
    coverPhotoUrl: business?.coverPhotoUrl || null,
    logoUrl: business?.logoUrl || null,
    galleryUrls: business?.galleryUrls || null,
    whatsappNumber: business?.whatsappNumber || null,
    email: business?.email || null,
    phone: vendor.user?.phone || business?.whatsappNumber || null,
    firstApprovedLogin: vendor.firstApprovedLogin,
    verified: ['approved', 'APPROVED'].includes(String(vendor.kycStatus || '')),
    createdAt: vendor.createdAt,
    services: services.map((service: any) => ({
      id: service.id,
      name_mr: service.nameMr ?? service.name_mr,
      name_en: service.nameEn ?? service.name_en,
      price: service.price,
      duration_mins: service.durationMins ?? service.duration_mins,
      description_mr: service.descriptionMr ?? service.description_mr,
      description_en: service.descriptionEn ?? service.description_en,
      isActive: service.isActive !== false,
    })),
    reviews: reviews.map((review: any) => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment || review.text || '',
      reply: review.reply,
      createdAt: review.createdAt instanceof Date ? review.createdAt.toISOString() : review.createdAt,
    })),
  };
}

export const vendorPublicInclude = {
  user: true,
  business: {
    include: {
      services: { where: { isActive: true, deletedAt: null } },
      reviews: { where: { deletedAt: null }, orderBy: { createdAt: 'desc' as const } },
      locations: { where: { deletedAt: null } },
    },
  },
};
