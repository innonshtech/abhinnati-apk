import { VendorRepository } from '../../../../domain/repositories/vendor.repository';
import { KycDocumentRepository } from '../../../../domain/repositories/kyc-document.repository';
import { AuditLogRepository } from '../../../../domain/repositories/audit-log.repository';
import { SubmitKycDocsRequest, UpdateKycStatusRequest } from '../../../dtos/vendor.dto';
import { StorageUploadService } from '../../../services/storage-upload.service';
import { NotFoundError, BadRequestError } from '../../../../presentation/utils/response';

export class KycUseCase {
  constructor(
    private vendorRepo: VendorRepository,
    private documentRepo: KycDocumentRepository,
    private auditRepo: AuditLogRepository
  ) {}

  private async getVendor(userId: string) {
    const vendor = await this.vendorRepo.findByUserId(userId);
    if (!vendor) {
      throw new NotFoundError('Vendor account not found');
    }
    return vendor;
  }

  async getKycStatus(userId: string) {
    const vendor = await this.getVendor(userId);
    const documents = await this.documentRepo.findByVendorId(vendor.id);
    return {
      vendorKycStatus: vendor.kycStatus,
      documents: documents.map((doc) => ({
        id: doc.id,
        documentType: doc.documentType,
        documentUrl: doc.documentUrl,
        status: doc.status,
        rejectionReason: doc.rejectionReason,
        createdAt: doc.createdAt,
      })),
    };
  }

  async uploadDocument(userId: string, dto: SubmitKycDocsRequest, ipAddress?: string, userAgent?: string) {
    const vendor = await this.getVendor(userId);

    // 1. Upload file to Supabase Storage
    const filename = `${vendor.id}-${dto.documentType}-${Date.now()}.png`;
    const publicUrl = await StorageUploadService.validateAndUpload(
      'profile-images',
      'vendors/documents',
      filename,
      dto.base64Data
    );

    // 2. Upsert KycDocument record
    const document = await this.documentRepo.upsert({
      vendorId: vendor.id,
      documentType: dto.documentType,
      documentUrl: publicUrl,
      status: 'pending',
    });

    // 3. Mark overall vendor status to 'under_review' if not approved
    if (vendor.kycStatus !== 'approved') {
      await this.vendorRepo.update(vendor.id, { kycStatus: 'under_review' });
    }

    await this.auditRepo.create({
      userId,
      action: 'UPLOAD_KYC_DOCUMENT',
      entityName: 'KycDocument',
      entityId: document.id,
      newValues: JSON.stringify({ documentType: dto.documentType, documentUrl: publicUrl }),
      ipAddress,
      userAgent,
    });

    return document;
  }

  /**
   * Admin verification endpoint to update doc status
   */
  async updateStatus(adminUserId: string, dto: UpdateKycStatusRequest, ipAddress?: string, userAgent?: string) {
    const vendor = await this.vendorRepo.findById(dto.vendorId);
    if (!vendor) {
      throw new NotFoundError('Vendor not found');
    }

    // 1. Update overall vendor KYC status
    const updatedVendor = await this.vendorRepo.update(vendor.id, {
      kycStatus: dto.status,
    });

    // 2. If status is rejected, verify all pending documents get marked as rejected or resubmission
    const documents = await this.documentRepo.findByVendorId(vendor.id);
    for (const doc of documents) {
      if (doc.status === 'pending' || doc.status === 'under_review') {
        const docStatus = dto.status === 'approved' ? 'approved' : dto.status === 'resubmission' ? 'resubmission' : 'rejected';
        await this.documentRepo.updateStatus(doc.id, docStatus, dto.rejectionReason);
      }
    }

    await this.auditRepo.create({
      userId: adminUserId,
      action: 'UPDATE_KYC_STATUS',
      entityName: 'Vendor',
      entityId: vendor.id,
      oldValues: JSON.stringify({ kycStatus: vendor.kycStatus }),
      newValues: JSON.stringify({ kycStatus: dto.status, rejectionReason: dto.rejectionReason }),
      ipAddress,
      userAgent,
    });

    return {
      vendorId: vendor.id,
      kycStatus: dto.status,
    };
  }
}
