import { UserRepository } from '../../../../domain/repositories/user.repository';
import { VendorRepository } from '../../../../domain/repositories/vendor.repository';
import { BusinessRepository } from '../../../../domain/repositories/business.repository';
import { NotFoundError } from '../../../../presentation/utils/response';

export class GetProfileUseCase {
  constructor(
    private userRepo: UserRepository,
    private vendorRepo: VendorRepository,
    private businessRepo: BusinessRepository
  ) {}

  async execute(userId: string) {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const vendor = await this.vendorRepo.findByUserId(userId);
    let business = null;
    if (vendor) {
      business = await this.businessRepo.findByVendorId(vendor.id);
    }

    return {
      user: {
        id: user.id,
        phone: user.phone,
        email: user.email,
        name: user.name,
        role: user.role,
        language: user.language,
        profileImage: user.profileImage, // fallback standard field name
      },
      vendor: vendor ? {
        id: vendor.id,
        kycStatus: vendor.kycStatus,
        firstApprovedLogin: vendor.firstApprovedLogin,
      } : null,
      business: business ? {
        id: business.id,
        nameMr: business.nameMr,
        nameEn: business.nameEn,
        descriptionMr: business.descriptionMr,
        descriptionEn: business.descriptionEn,
        logoUrl: business.logoUrl,
        coverPhotoUrl: business.coverPhotoUrl,
        galleryUrls: business.galleryUrls ? JSON.parse(business.galleryUrls) : [],
        whatsappNumber: business.whatsappNumber,
        email: business.email,
        ratingAvg: business.ratingAvg,
        reviewsCount: business.reviewsCount,
        serviceRadius: business.serviceRadius,
      } : null,
    };
  }
}
