import { BusinessRepository } from '../../../../domain/repositories/business.repository';
import { VendorRepository } from '../../../../domain/repositories/vendor.repository';
import { ServiceRepository } from '../../../../domain/repositories/service.repository';
import { AuditLogRepository } from '../../../../domain/repositories/audit-log.repository';
import { CreateServiceRequest, UpdateServiceRequest } from '../../../dtos/vendor.dto';
import { NotFoundError } from '../../../../presentation/utils/response';

export class ServicesUseCase {
  constructor(
    private businessRepo: BusinessRepository,
    private vendorRepo: VendorRepository,
    private serviceRepo: ServiceRepository,
    private auditRepo: AuditLogRepository
  ) {}

  private async getBusiness(userId: string) {
    const vendor = await this.vendorRepo.findByUserId(userId);
    if (!vendor) {
      throw new NotFoundError('Vendor account not found');
    }
    const business = await this.businessRepo.findByVendorId(vendor.id);
    if (!business) {
      throw new NotFoundError('Business details not found');
    }
    return business;
  }

  async getServices(userId: string) {
    const business = await this.getBusiness(userId);
    return this.serviceRepo.findByBusinessId(business.id);
  }

  async createService(userId: string, dto: CreateServiceRequest, ipAddress?: string, userAgent?: string) {
    const business = await this.getBusiness(userId);

    const service = await this.serviceRepo.create({
      businessId: business.id,
      nameMr: dto.nameMr,
      nameEn: dto.nameEn,
      price: dto.price,
      durationMins: dto.durationMins,
      descriptionMr: dto.descriptionMr,
      descriptionEn: dto.descriptionEn,
      isActive: dto.isActive,
    });

    await this.auditRepo.create({
      userId,
      action: 'CREATE_SERVICE',
      entityName: 'VendorService',
      entityId: service.id,
      newValues: JSON.stringify(service),
      ipAddress,
      userAgent,
    });

    return service;
  }

  async updateService(userId: string, serviceId: string, dto: UpdateServiceRequest, ipAddress?: string, userAgent?: string) {
    const business = await this.getBusiness(userId);
    const service = await this.serviceRepo.findById(serviceId);

    if (!service || service.businessId !== business.id) {
      throw new NotFoundError('Service not found or unauthorized');
    }

    const updated = await this.serviceRepo.update(serviceId, {
      nameMr: dto.nameMr ?? undefined,
      nameEn: dto.nameEn ?? undefined,
      price: dto.price ?? undefined,
      durationMins: dto.durationMins ?? undefined,
      descriptionMr: dto.descriptionMr ?? undefined,
      descriptionEn: dto.descriptionEn ?? undefined,
      isActive: dto.isActive ?? undefined,
    });

    await this.auditRepo.create({
      userId,
      action: 'UPDATE_SERVICE',
      entityName: 'VendorService',
      entityId: serviceId,
      oldValues: JSON.stringify(service),
      newValues: JSON.stringify(updated),
      ipAddress,
      userAgent,
    });

    return updated;
  }

  async deleteService(userId: string, serviceId: string, ipAddress?: string, userAgent?: string) {
    const business = await this.getBusiness(userId);
    const service = await this.serviceRepo.findById(serviceId);

    if (!service || service.businessId !== business.id) {
      throw new NotFoundError('Service not found or unauthorized');
    }

    const deleted = await this.serviceRepo.deleteSoft(serviceId, userId);

    await this.auditRepo.create({
      userId,
      action: 'DELETE_SERVICE',
      entityName: 'VendorService',
      entityId: serviceId,
      ipAddress,
      userAgent,
    });

    return deleted;
  }
}
