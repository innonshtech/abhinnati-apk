export interface AreaDTO {
  id: string;
  name: string;
  name_en: string;
  name_mr: string;
  latitude: number;
  longitude: number;
}

export interface CategoryDTO {
  id: string;
  slug: string;
  name_en: string;
  name_mr: string;
  iconName: string;
  businessCount: number;
}

export interface BusinessSummaryDTO {
  id: string;
  businessNameEn: string;
  businessNameMr: string;
  categorySlug: string;
  categoryNameEn: string;
  categoryNameMr: string;
  descriptionEn: string;
  descriptionMr: string;
  ratingAvg: number;
  reviewsCount: number;
  imageUrl: string | null;
  latitude: number;
  longitude: number;
  distanceVal: number;
  verified: boolean;
}

export interface ServiceDTO {
  id: string;
  name_en: string;
  name_mr: string;
  price: number;
  duration_mins: number;
  description_en: string;
  description_mr: string;
}

export interface ReviewDTO {
  id: string;
  userName: string;
  userDisplayName: string;
  userProfileImage: string | null;
  rating: number;
  text: string;
  reply: string | null;
  createdAt: string;
}

export interface BusinessDetailDTO {
  id: string;
  businessNameEn: string;
  businessNameMr: string;
  categorySlug: string;
  categoryNameEn: string;
  categoryNameMr: string;
  descriptionEn: string;
  descriptionMr: string;
  ratingAvg: number;
  reviewsCount: number;
  imageUrl: string | null;
  latitude: number;
  longitude: number;
  distance: number;
  verified: boolean;
  verificationStatus: string;
  services: ServiceDTO[];
  reviews: ReviewDTO[];
  contactInfo: {
    phone: string;
    ownerName: string;
  };
  workingHours: Record<string, string>;
  similarBusinesses?: BusinessSummaryDTO[];
}

export function toAreaDTO(area: any): AreaDTO {
  return {
    id: area.id,
    name: area.name,
    name_en: area.name,
    name_mr: area.name,
    latitude: area.latitude,
    longitude: area.longitude,
  };
}

export function toCategoryDTO(cat: any, count: number): CategoryDTO {
  return {
    id: cat.id,
    slug: cat.slug,
    name_en: cat.name_en,
    name_mr: cat.name_mr,
    iconName: cat.iconName,
    businessCount: count,
  };
}

export function toBusinessSummaryDTO(vendor: any): BusinessSummaryDTO {
  return {
    id: vendor.id,
    businessNameEn: vendor.businessNameEn,
    businessNameMr: vendor.businessNameMr,
    categorySlug: vendor.categorySlug,
    categoryNameEn: vendor.categoryNameEn,
    categoryNameMr: vendor.categoryNameMr,
    descriptionEn: vendor.descriptionEn,
    descriptionMr: vendor.descriptionMr,
    ratingAvg: vendor.ratingAvg,
    reviewsCount: vendor.reviewsCount,
    imageUrl: vendor.imageUrl || null,
    latitude: vendor.latitude,
    longitude: vendor.longitude,
    distanceVal: vendor.distanceVal || 0,
    verified: vendor.kycStatus === 'approved',
  };
}

export function toBusinessDetailDTO(vendor: any, distance: number, similar: BusinessSummaryDTO[] = []): BusinessDetailDTO {
  return {
    id: vendor.id,
    businessNameEn: vendor.businessNameEn,
    businessNameMr: vendor.businessNameMr,
    categorySlug: vendor.categorySlug,
    categoryNameEn: vendor.categoryNameEn,
    categoryNameMr: vendor.categoryNameMr,
    descriptionEn: vendor.descriptionEn,
    descriptionMr: vendor.descriptionMr,
    ratingAvg: vendor.ratingAvg,
    reviewsCount: vendor.reviewsCount,
    imageUrl: vendor.imageUrl || null,
    latitude: vendor.latitude,
    longitude: vendor.longitude,
    distance,
    verified: vendor.kycStatus === 'approved',
    verificationStatus: vendor.kycStatus,
    services: (vendor.services || []).map((s: any) => ({
      id: s.id,
      name_en: s.name_en,
      name_mr: s.name_mr,
      price: s.price,
      duration_mins: s.duration_mins,
      description_en: s.description_en,
      description_mr: s.description_mr,
    })),
    reviews: (vendor.reviews || []).map((r: any) => ({
      id: r.id,
      userName: r.userName,
      userDisplayName: r.user?.displayName || r.userName,
      userProfileImage: r.user?.profileImage || null,
      rating: r.rating,
      text: r.text,
      reply: r.reply,
      createdAt: r.createdAt.toISOString ? r.createdAt.toISOString() : r.createdAt,
    })),
    contactInfo: {
      phone: vendor.user?.phone || '',
      ownerName: vendor.user?.fullName || vendor.user?.displayName || '',
    },
    workingHours: {
      monday: '09:00 AM - 08:00 PM',
      tuesday: '09:00 AM - 08:00 PM',
      wednesday: '09:00 AM - 08:00 PM',
      thursday: '09:00 AM - 08:00 PM',
      friday: '09:00 AM - 08:00 PM',
      saturday: '09:00 AM - 06:00 PM',
      sunday: 'Closed',
    },
    similarBusinesses: similar,
  };
}
