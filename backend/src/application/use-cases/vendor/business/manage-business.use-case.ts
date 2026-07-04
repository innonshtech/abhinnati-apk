import { BusinessRepository } from '../../../../domain/repositories/business.repository';
import { VendorRepository } from '../../../../domain/repositories/vendor.repository';
import { AuditLogRepository } from '../../../../domain/repositories/audit-log.repository';
import { CreateBusinessRequest, UpdateBusinessRequest } from '../../../dtos/vendor.dto';
import { StorageUploadService } from '../../../services/storage-upload.service';
import { NotFoundError, BadRequestError } from '../../../../presentation/utils/response';

export class ManageBusinessUseCase {
  constructor(
    private businessRepo: BusinessRepository,
    private vendorRepo: VendorRepository,
    private auditRepo: AuditLogRepository
  ) {}

  private async getVendorAndBusiness(userId: string) {
    const vendor = await this.vendorRepo.findByUserId(userId);
    if (!vendor) {
      throw new NotFoundError('Vendor account not found');
    }
    const business = await this.businessRepo.findByVendorId(vendor.id);
    return { vendor, business };
  }

  async getBusiness(userId: string) {
    const { business } = await this.getVendorAndBusiness(userId);
    if (!business) {
      throw new NotFoundError('Business details not found');
    }
    return business;
  }

  async createBusiness(userId: string, dto: CreateBusinessRequest, ipAddress?: string, userAgent?: string) {
    const vendor = await this.vendorRepo.findByUserId(userId);
    if (!vendor) {
      throw new NotFoundError('Vendor account not found');
    }

    const existingBusiness = await this.businessRepo.findByVendorId(vendor.id);
    if (existingBusiness) {
      throw new BadRequestError('Business already exists for this vendor');
    }

    const business = await this.businessRepo.create({
      vendorId: vendor.id,
      nameMr: dto.nameMr,
      nameEn: dto.nameEn,
      descriptionMr: dto.descriptionMr,
      descriptionEn: dto.descriptionEn,
      whatsappNumber: dto.whatsappNumber || undefined,
      email: dto.email || undefined,
      serviceRadius: dto.serviceRadius,
    });

    await this.auditRepo.create({
      userId,
      action: 'CREATE_BUSINESS',
      entityName: 'Business',
      entityId: business.id,
      newValues: JSON.stringify(business),
      ipAddress,
      userAgent,
    });

    return business;
  }

  async updateBusiness(userId: string, dto: UpdateBusinessRequest, ipAddress?: string, userAgent?: string) {
    const { business } = await this.getVendorAndBusiness(userId);
    if (!business) {
      throw new NotFoundError('Business details not found');
    }

    const updated = await this.businessRepo.update(business.id, {
      nameMr: dto.nameMr ?? undefined,
      nameEn: dto.nameEn ?? undefined,
      descriptionMr: dto.descriptionMr ?? undefined,
      descriptionEn: dto.descriptionEn ?? undefined,
      whatsappNumber: dto.whatsappNumber ?? undefined,
      email: dto.email ?? undefined,
      serviceRadius: dto.serviceRadius ?? undefined,
      emergencyStatus: dto.emergencyStatus ?? undefined,
    });

    await this.auditRepo.create({
      userId,
      action: 'UPDATE_BUSINESS',
      entityName: 'Business',
      entityId: business.id,
      oldValues: JSON.stringify(business),
      newValues: JSON.stringify(updated),
      ipAddress,
      userAgent,
    });

    return updated;
  }

  async deleteBusiness(userId: string, ipAddress?: string, userAgent?: string) {
    const { business } = await this.getVendorAndBusiness(userId);
    if (!business) {
      throw new NotFoundError('Business details not found');
    }

    const deleted = await this.businessRepo.deleteSoft(business.id, userId);

    await this.auditRepo.create({
      userId,
      action: 'DELETE_BUSINESS',
      entityName: 'Business',
      entityId: business.id,
      ipAddress,
      userAgent,
    });

    return deleted;
  }

  async uploadLogo(userId: string, base64Data: string, ipAddress?: string, userAgent?: string) {
    const { business } = await this.getVendorAndBusiness(userId);
    if (!business) {
      throw new NotFoundError('Business details not found');
    }

    const filename = `${business.id}-logo-${Date.now()}.png`;
    const publicUrl = await StorageUploadService.validateAndUpload(
      'profile-images',
      'vendors/logos',
      filename,
      base64Data
    );

    const updated = await this.businessRepo.update(business.id, { logoUrl: publicUrl });

    await this.auditRepo.create({
      userId,
      action: 'UPLOAD_BUSINESS_LOGO',
      entityName: 'Business',
      entityId: business.id,
      newValues: JSON.stringify({ logoUrl: publicUrl }),
      ipAddress,
      userAgent,
    });

    return { logoUrl: publicUrl };
  }

  async deleteLogo(userId: string, ipAddress?: string, userAgent?: string) {
    const { business } = await this.getVendorAndBusiness(userId);
    if (!business) {
      throw new NotFoundError('Business details not found');
    }

    await this.businessRepo.update(business.id, { logoUrl: null });

    await this.auditRepo.create({
      userId,
      action: 'DELETE_BUSINESS_LOGO',
      entityName: 'Business',
      entityId: business.id,
      ipAddress,
      userAgent,
    });

    return { logoUrl: null };
  }

  async uploadCoverPhoto(userId: string, base64Data: string, ipAddress?: string, userAgent?: string) {
    const { business } = await this.getVendorAndBusiness(userId);
    if (!business) {
      throw new NotFoundError('Business details not found');
    }

    const filename = `${business.id}-cover-${Date.now()}.png`;
    const publicUrl = await StorageUploadService.validateAndUpload(
      'profile-images',
      'vendors/cover',
      filename,
      base64Data
    );

    const updated = await this.businessRepo.update(business.id, { coverPhotoUrl: publicUrl });

    await this.auditRepo.create({
      userId,
      action: 'UPLOAD_BUSINESS_COVER',
      entityName: 'Business',
      entityId: business.id,
      newValues: JSON.stringify({ coverPhotoUrl: publicUrl }),
      ipAddress,
      userAgent,
    });

    return { coverPhotoUrl: publicUrl };
  }

  async deleteCoverPhoto(userId: string, ipAddress?: string, userAgent?: string) {
    const { business } = await this.getVendorAndBusiness(userId);
    if (!business) {
      throw new NotFoundError('Business details not found');
    }

    await this.businessRepo.update(business.id, { coverPhotoUrl: null });

    await this.auditRepo.create({
      userId,
      action: 'DELETE_BUSINESS_COVER',
      entityName: 'Business',
      entityId: business.id,
      ipAddress,
      userAgent,
    });

    return { coverPhotoUrl: null };
  }

  async uploadGalleryImages(userId: string, base64Images: string[], ipAddress?: string, userAgent?: string) {
    const { business } = await this.getVendorAndBusiness(userId);
    if (!business) {
      throw new NotFoundError('Business details not found');
    }

    const currentGallery: string[] = business.galleryUrls ? JSON.parse(business.galleryUrls) : [];
    const newUrls: string[] = [];

    for (let i = 0; i < base64Images.length; i++) {
      const filename = `${business.id}-gallery-${Date.now()}-${i}.png`;
      const publicUrl = await StorageUploadService.validateAndUpload(
        'profile-images',
        'vendors/gallery',
        filename,
        base64Images[i]
      );
      newUrls.push(publicUrl);
    }

    const updatedGallery = [...currentGallery, ...newUrls];
    await this.businessRepo.update(business.id, { galleryUrls: JSON.stringify(updatedGallery) });

    await this.auditRepo.create({
      userId,
      action: 'UPLOAD_BUSINESS_GALLERY',
      entityName: 'Business',
      entityId: business.id,
      newValues: JSON.stringify({ galleryUrls: updatedGallery }),
      ipAddress,
      userAgent,
    });

    return { galleryUrls: updatedGallery };
  }

  async deleteGalleryImage(userId: string, imageUrl: string, ipAddress?: string, userAgent?: string) {
    const { business } = await this.getVendorAndBusiness(userId);
    if (!business) {
      throw new NotFoundError('Business details not found');
    }

    const currentGallery: string[] = business.galleryUrls ? JSON.parse(business.galleryUrls) : [];
    const updatedGallery = currentGallery.filter((url) => url !== imageUrl);

    await this.businessRepo.update(business.id, { galleryUrls: JSON.stringify(updatedGallery) });

    await this.auditRepo.create({
      userId,
      action: 'DELETE_BUSINESS_GALLERY',
      entityName: 'Business',
      entityId: business.id,
      newValues: JSON.stringify({ galleryUrls: updatedGallery }),
      ipAddress,
      userAgent,
    });

    return { galleryUrls: updatedGallery };
  }

  async reorderGallery(userId: string, urls: string[], ipAddress?: string, userAgent?: string) {
    const { business } = await this.getVendorAndBusiness(userId);
    if (!business) {
      throw new NotFoundError('Business details not found');
    }

    await this.businessRepo.update(business.id, { galleryUrls: JSON.stringify(urls) });

    await this.auditRepo.create({
      userId,
      action: 'REORDER_BUSINESS_GALLERY',
      entityName: 'Business',
      entityId: business.id,
      newValues: JSON.stringify({ galleryUrls: urls }),
      ipAddress,
      userAgent,
    });

    return { galleryUrls: urls };
  }
}
