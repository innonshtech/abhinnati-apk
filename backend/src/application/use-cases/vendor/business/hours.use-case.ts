import { BusinessRepository } from '../../../../domain/repositories/business.repository';
import { VendorRepository } from '../../../../domain/repositories/vendor.repository';
import { BusinessHoursRepository } from '../../../../domain/repositories/business-hours.repository';
import { AuditLogRepository } from '../../../../domain/repositories/audit-log.repository';
import { UpdateBusinessHoursRequest } from '../../../dtos/vendor.dto';
import { NotFoundError } from '../../../../presentation/utils/response';

export class BusinessHoursUseCase {
  constructor(
    private businessRepo: BusinessRepository,
    private vendorRepo: VendorRepository,
    private hoursRepo: BusinessHoursRepository,
    private auditRepo: AuditLogRepository
  ) {}

  private async getVendorAndBusiness(userId: string) {
    const vendor = await this.vendorRepo.findByUserId(userId);
    if (!vendor) {
      throw new NotFoundError('Vendor account not found');
    }
    const business = await this.businessRepo.findByVendorId(vendor.id);
    if (!business) {
      throw new NotFoundError('Business details not found');
    }
    return { vendor, business };
  }

  async getHours(userId: string) {
    const { business } = await this.getVendorAndBusiness(userId);
    const schedule = await this.hoursRepo.findByBusinessId(business.id);
    return {
      schedule: schedule.map((s) => ({
        dayOfWeek: s.dayOfWeek,
        openTime: s.openTime,
        closeTime: s.closeTime,
        isClosed: s.isClosed,
      })),
      vacationMode: business.vacationMode,
      vacationStart: business.vacationStart,
      vacationEnd: business.vacationEnd,
      vacationReason: business.vacationReason,
      blockedDates: business.blockedDates ? JSON.parse(business.blockedDates) : [],
      blockedSlots: business.blockedSlots ? JSON.parse(business.blockedSlots) : [],
    };
  }

  async updateHours(userId: string, dto: UpdateBusinessHoursRequest, ipAddress?: string, userAgent?: string) {
    const { business } = await this.getVendorAndBusiness(userId);

    // 1. Update weekly schedule if provided
    if (dto.schedule) {
      for (const day of dto.schedule) {
        await this.hoursRepo.upsert({
          businessId: business.id,
          dayOfWeek: day.dayOfWeek,
          openTime: day.openTime,
          closeTime: day.closeTime,
          isClosed: day.isClosed,
        });
      }
    }

    // 2. Update vacation / holidays / blocked parameters on the Business profile
    const updatedBusiness = await this.businessRepo.update(business.id, {
      vacationMode: dto.vacationMode ?? undefined,
      vacationStart: dto.vacationStart ? new Date(dto.vacationStart) : dto.vacationStart === null ? null : undefined,
      vacationEnd: dto.vacationEnd ? new Date(dto.vacationEnd) : dto.vacationEnd === null ? null : undefined,
      vacationReason: dto.vacationReason ?? undefined,
      blockedDates: dto.blockedDates ? JSON.stringify(dto.blockedDates) : undefined,
      blockedSlots: dto.blockedSlots ? JSON.stringify(dto.blockedSlots) : undefined,
    });

    await this.auditRepo.create({
      userId,
      action: 'UPDATE_BUSINESS_HOURS',
      entityName: 'Business',
      entityId: business.id,
      newValues: JSON.stringify({
        schedule: dto.schedule,
        vacationMode: updatedBusiness.vacationMode,
        blockedDates: updatedBusiness.blockedDates,
        blockedSlots: updatedBusiness.blockedSlots,
      }),
      ipAddress,
      userAgent,
    });

    return this.getHours(userId);
  }
}
