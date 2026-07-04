import { NextRequest } from 'next/server';
import { ApiResponse, BadRequestError, UnauthorizedError, HttpError } from '../utils/response';
import {
  UpdateProfileSchema,
  UpdateAddressSchema,
  CreateBusinessSchema,
  UpdateBusinessSchema,
  UploadAssetSchema,
  ReorderGallerySchema,
  UpdateLocationSchema,
  UpdateBusinessHoursSchema,
  CreateServiceSchema,
  UpdateServiceSchema,
  SubmitKycDocsSchema,
  UpdateKycStatusSchema,
} from '../../application/dtos/vendor.dto';

import { GetProfileUseCase } from '../../application/use-cases/vendor/profile/get-profile.use-case';
import { UpdateProfileUseCase } from '../../application/use-cases/vendor/profile/update-profile.use-case';
import { ManageBusinessUseCase } from '../../application/use-cases/vendor/business/manage-business.use-case';
import { BusinessHoursUseCase } from '../../application/use-cases/vendor/business/hours.use-case';
import { LocationUseCase } from '../../application/use-cases/vendor/business/location.use-case';
import { ServicesUseCase } from '../../application/use-cases/vendor/services/services.use-case';
import { KycUseCase } from '../../application/use-cases/vendor/kyc/kyc.use-case';

import { PrismaUserRepository } from '../../infrastructure/repositories/prisma-user.repository';
import { PrismaVendorRepository } from '../../infrastructure/repositories/prisma-vendor.repository';
import { PrismaBusinessRepository } from '../../infrastructure/repositories/prisma-business.repository';
import { PrismaRefreshTokenRepository } from '../../infrastructure/repositories/prisma-refresh-token.repository';
import { PrismaAuditLogRepository } from '../../infrastructure/repositories/prisma-audit-log.repository';
import { PrismaKycDocumentRepository } from '../../infrastructure/repositories/prisma-kyc-document.repository';
import { PrismaServiceRepository } from '../../infrastructure/repositories/prisma-service.repository';
import { PrismaBusinessHoursRepository } from '../../infrastructure/repositories/prisma-business-hours.repository';
import { PrismaLocationRepository } from '../../infrastructure/repositories/prisma-location.repository';

import { AuthMiddleware } from '../middleware/auth.middleware';

export class VendorController {
  // Repositories initialization
  private static userRepo = new PrismaUserRepository();
  private static vendorRepo = new PrismaVendorRepository();
  private static businessRepo = new PrismaBusinessRepository();
  private static auditRepo = new PrismaAuditLogRepository();
  private static docRepo = new PrismaKycDocumentRepository();
  private static serviceRepo = new PrismaServiceRepository();
  private static hoursRepo = new PrismaBusinessHoursRepository();
  private static locationRepo = new PrismaLocationRepository();

  // Use cases initialization
  private static getProfileUseCase = new GetProfileUseCase(this.userRepo, this.vendorRepo, this.businessRepo);
  private static updateProfileUseCase = new UpdateProfileUseCase(this.userRepo, this.auditRepo);
  private static manageBusinessUseCase = new ManageBusinessUseCase(this.businessRepo, this.vendorRepo, this.auditRepo);
  private static hoursUseCase = new BusinessHoursUseCase(this.businessRepo, this.vendorRepo, this.hoursRepo, this.auditRepo);
  private static locationUseCase = new LocationUseCase(this.businessRepo, this.vendorRepo, this.locationRepo, this.auditRepo);
  private static servicesUseCase = new ServicesUseCase(this.businessRepo, this.vendorRepo, this.serviceRepo, this.auditRepo);
  private static kycUseCase = new KycUseCase(this.vendorRepo, this.docRepo, this.auditRepo);

  private static getContext(req: NextRequest) {
    const ipAddress = req.headers.get('x-forwarded-for') || undefined;
    const userAgent = req.headers.get('user-agent') || undefined;
    return { ipAddress, userAgent };
  }

  // --- Profile Endpoints ---

  static async getProfile(req: NextRequest) {
    try {
      const user = await AuthMiddleware.authenticate(req);
      const profile = await this.getProfileUseCase.execute(user.userId);
      return ApiResponse.success(profile, 'Vendor profile fetched successfully');
    } catch (error) {
      return ApiResponse.handle(error);
    }
  }

  static async updateProfile(req: NextRequest) {
    try {
      const user = await AuthMiddleware.authenticate(req);
      const body = await req.json();
      const validation = UpdateProfileSchema.safeParse(body);
      if (!validation.success) {
        throw new BadRequestError('Validation failed', validation.error.format());
      }
      const { ipAddress, userAgent } = this.getContext(req);
      const profile = await this.updateProfileUseCase.execute(user.userId, validation.data, ipAddress, userAgent);
      return ApiResponse.success(profile, 'Profile updated successfully');
    } catch (error) {
      return ApiResponse.handle(error);
    }
  }

  static async uploadProfilePicture(req: NextRequest) {
    try {
      const user = await AuthMiddleware.authenticate(req);
      const body = await req.json();
      const validation = UploadAssetSchema.safeParse(body);
      if (!validation.success) {
        throw new BadRequestError('Validation failed', validation.error.format());
      }
      const { ipAddress, userAgent } = this.getContext(req);
      const result = await this.updateProfileUseCase.uploadProfilePicture(user.userId, validation.data.base64Data, ipAddress, userAgent);
      return ApiResponse.success(result, 'Profile picture uploaded successfully');
    } catch (error) {
      return ApiResponse.handle(error);
    }
  }

  static async deleteProfilePicture(req: NextRequest) {
    try {
      const user = await AuthMiddleware.authenticate(req);
      const { ipAddress, userAgent } = this.getContext(req);
      const result = await this.updateProfileUseCase.deleteProfilePicture(user.userId, ipAddress, userAgent);
      return ApiResponse.success(result, 'Profile picture deleted successfully');
    } catch (error) {
      return ApiResponse.handle(error);
    }
  }

  // --- Business Management Endpoints ---

  static async getBusiness(req: NextRequest) {
    try {
      const user = await AuthMiddleware.authorize(req, ['vendor', 'admin']);
      const business = await this.manageBusinessUseCase.getBusiness(user.userId);
      return ApiResponse.success(business, 'Business details fetched successfully');
    } catch (error) {
      return ApiResponse.handle(error);
    }
  }

  static async createBusiness(req: NextRequest) {
    try {
      const user = await AuthMiddleware.authorize(req, ['vendor']);
      const body = await req.json();
      const validation = CreateBusinessSchema.safeParse(body);
      if (!validation.success) {
        throw new BadRequestError('Validation failed', validation.error.format());
      }
      const { ipAddress, userAgent } = this.getContext(req);
      const business = await this.manageBusinessUseCase.createBusiness(user.userId, validation.data, ipAddress, userAgent);
      return ApiResponse.success(business, 'Business created successfully', 201);
    } catch (error) {
      return ApiResponse.handle(error);
    }
  }

  static async updateBusiness(req: NextRequest) {
    try {
      const user = await AuthMiddleware.authorize(req, ['vendor']);
      const body = await req.json();
      const validation = UpdateBusinessSchema.safeParse(body);
      if (!validation.success) {
        throw new BadRequestError('Validation failed', validation.error.format());
      }
      const { ipAddress, userAgent } = this.getContext(req);
      const business = await this.manageBusinessUseCase.updateBusiness(user.userId, validation.data, ipAddress, userAgent);
      return ApiResponse.success(business, 'Business updated successfully');
    } catch (error) {
      return ApiResponse.handle(error);
    }
  }

  static async deleteBusiness(req: NextRequest) {
    try {
      const user = await AuthMiddleware.authorize(req, ['vendor', 'admin']);
      const { ipAddress, userAgent } = this.getContext(req);
      const deleted = await this.manageBusinessUseCase.deleteBusiness(user.userId, ipAddress, userAgent);
      return ApiResponse.success(deleted, 'Business deleted successfully');
    } catch (error) {
      return ApiResponse.handle(error);
    }
  }

  // --- Asset Upload Endpoints (Logo, Cover, Gallery) ---

  static async uploadLogo(req: NextRequest) {
    try {
      const user = await AuthMiddleware.authorize(req, ['vendor']);
      const body = await req.json();
      const validation = UploadAssetSchema.safeParse(body);
      if (!validation.success) {
        throw new BadRequestError('Validation failed', validation.error.format());
      }
      const { ipAddress, userAgent } = this.getContext(req);
      const result = await this.manageBusinessUseCase.uploadLogo(user.userId, validation.data.base64Data, ipAddress, userAgent);
      return ApiResponse.success(result, 'Business logo uploaded successfully');
    } catch (error) {
      return ApiResponse.handle(error);
    }
  }

  static async deleteLogo(req: NextRequest) {
    try {
      const user = await AuthMiddleware.authorize(req, ['vendor']);
      const { ipAddress, userAgent } = this.getContext(req);
      const result = await this.manageBusinessUseCase.deleteLogo(user.userId, ipAddress, userAgent);
      return ApiResponse.success(result, 'Business logo deleted successfully');
    } catch (error) {
      return ApiResponse.handle(error);
    }
  }

  static async uploadCoverPhoto(req: NextRequest) {
    try {
      const user = await AuthMiddleware.authorize(req, ['vendor']);
      const body = await req.json();
      const validation = UploadAssetSchema.safeParse(body);
      if (!validation.success) {
        throw new BadRequestError('Validation failed', validation.error.format());
      }
      const { ipAddress, userAgent } = this.getContext(req);
      const result = await this.manageBusinessUseCase.uploadCoverPhoto(user.userId, validation.data.base64Data, ipAddress, userAgent);
      return ApiResponse.success(result, 'Business cover photo uploaded successfully');
    } catch (error) {
      return ApiResponse.handle(error);
    }
  }

  static async deleteCoverPhoto(req: NextRequest) {
    try {
      const user = await AuthMiddleware.authorize(req, ['vendor']);
      const { ipAddress, userAgent } = this.getContext(req);
      const result = await this.manageBusinessUseCase.deleteCoverPhoto(user.userId, ipAddress, userAgent);
      return ApiResponse.success(result, 'Business cover photo deleted successfully');
    } catch (error) {
      return ApiResponse.handle(error);
    }
  }

  static async uploadGalleryImages(req: NextRequest) {
    try {
      const user = await AuthMiddleware.authorize(req, ['vendor']);
      const body = await req.json();
      if (!body.images || !Array.isArray(body.images)) {
        throw new BadRequestError('Missing images array parameter');
      }
      const { ipAddress, userAgent } = this.getContext(req);
      const result = await this.manageBusinessUseCase.uploadGalleryImages(user.userId, body.images, ipAddress, userAgent);
      return ApiResponse.success(result, 'Business gallery uploaded successfully');
    } catch (error) {
      return ApiResponse.handle(error);
    }
  }

  static async deleteGalleryImage(req: NextRequest) {
    try {
      const user = await AuthMiddleware.authorize(req, ['vendor']);
      const body = await req.json();
      if (!body.imageUrl) {
        throw new BadRequestError('Missing imageUrl parameter');
      }
      const { ipAddress, userAgent } = this.getContext(req);
      const result = await this.manageBusinessUseCase.deleteGalleryImage(user.userId, body.imageUrl, ipAddress, userAgent);
      return ApiResponse.success(result, 'Business gallery image deleted successfully');
    } catch (error) {
      return ApiResponse.handle(error);
    }
  }

  static async reorderGallery(req: NextRequest) {
    try {
      const user = await AuthMiddleware.authorize(req, ['vendor']);
      const body = await req.json();
      const validation = ReorderGallerySchema.safeParse(body);
      if (!validation.success) {
        throw new BadRequestError('Validation failed', validation.error.format());
      }
      const { ipAddress, userAgent } = this.getContext(req);
      const result = await this.manageBusinessUseCase.reorderGallery(user.userId, validation.data.urls, ipAddress, userAgent);
      return ApiResponse.success(result, 'Business gallery reordered successfully');
    } catch (error) {
      return ApiResponse.handle(error);
    }
  }

  // --- Geolocation & Location Endpoints ---

  static async getBusinessLocation(req: NextRequest) {
    try {
      const user = await AuthMiddleware.authorize(req, ['vendor', 'admin']);
      const location = await this.locationUseCase.getBusinessLocation(user.userId);
      return ApiResponse.success(location, 'Business location coordinates fetched');
    } catch (error) {
      return ApiResponse.handle(error);
    }
  }

  static async updateLocation(req: NextRequest) {
    try {
      const user = await AuthMiddleware.authorize(req, ['vendor']);
      const body = await req.json();
      const validation = UpdateLocationSchema.safeParse(body);
      if (!validation.success) {
        throw new BadRequestError('Validation failed', validation.error.format());
      }
      const { ipAddress, userAgent } = this.getContext(req);
      const location = await this.locationUseCase.updateLocation(user.userId, validation.data, ipAddress, userAgent);
      return ApiResponse.success(location, 'Location details updated successfully');
    } catch (error) {
      return ApiResponse.handle(error);
    }
  }

  static async reverseGeocode(req: NextRequest) {
    try {
      await AuthMiddleware.authenticate(req);
      const { searchParams } = new URL(req.url);
      const lat = parseFloat(searchParams.get('latitude') || '');
      const lon = parseFloat(searchParams.get('longitude') || '');

      if (isNaN(lat) || isNaN(lon)) {
        throw new BadRequestError('latitude and longitude parameters must be valid numeric values');
      }

      const result = await this.locationUseCase.reverseGeocode(lat, lon);
      return ApiResponse.success(result, 'Reverse geocoded location coordinates successfully');
    } catch (error) {
      return ApiResponse.handle(error);
    }
  }

  static async searchNearby(req: NextRequest) {
    try {
      const { searchParams } = new URL(req.url);
      const lat = parseFloat(searchParams.get('latitude') || '');
      const lon = parseFloat(searchParams.get('longitude') || '');
      const radius = parseFloat(searchParams.get('radius') || '5.0');

      if (isNaN(lat) || isNaN(lon)) {
        throw new BadRequestError('latitude and longitude parameters must be valid numeric values');
      }

      const result = await this.locationUseCase.searchNearby(lat, lon, radius);
      return ApiResponse.success(result, 'Nearby business search executed successfully');
    } catch (error) {
      return ApiResponse.handle(error);
    }
  }

  // --- Operating Hours & Holiday Schedules Endpoints ---

  static async getHours(req: NextRequest) {
    try {
      const user = await AuthMiddleware.authorize(req, ['vendor', 'admin']);
      const hours = await this.hoursUseCase.getHours(user.userId);
      return ApiResponse.success(hours, 'Business timing schedules fetched successfully');
    } catch (error) {
      return ApiResponse.handle(error);
    }
  }

  static async updateHours(req: NextRequest) {
    try {
      const user = await AuthMiddleware.authorize(req, ['vendor']);
      const body = await req.json();
      const validation = UpdateBusinessHoursSchema.safeParse(body);
      if (!validation.success) {
        throw new BadRequestError('Validation failed', validation.error.format());
      }
      const { ipAddress, userAgent } = this.getContext(req);
      const hours = await this.hoursUseCase.updateHours(user.userId, validation.data, ipAddress, userAgent);
      return ApiResponse.success(hours, 'Business hours schedule updated successfully');
    } catch (error) {
      return ApiResponse.handle(error);
    }
  }

  // --- Services CRUD Endpoints ---

  static async getServices(req: NextRequest) {
    try {
      const user = await AuthMiddleware.authorize(req, ['vendor', 'admin']);
      const services = await this.servicesUseCase.getServices(user.userId);
      return ApiResponse.success(services, 'Vendor services list fetched successfully');
    } catch (error) {
      return ApiResponse.handle(error);
    }
  }

  static async createService(req: NextRequest) {
    try {
      const user = await AuthMiddleware.authorize(req, ['vendor']);
      const body = await req.json();
      const validation = CreateServiceSchema.safeParse(body);
      if (!validation.success) {
        throw new BadRequestError('Validation failed', validation.error.format());
      }
      const { ipAddress, userAgent } = this.getContext(req);
      const service = await this.servicesUseCase.createService(user.userId, validation.data, ipAddress, userAgent);
      return ApiResponse.success(service, 'Service item created successfully', 201);
    } catch (error) {
      return ApiResponse.handle(error);
    }
  }

  static async updateService(req: NextRequest, serviceId: string) {
    try {
      const user = await AuthMiddleware.authorize(req, ['vendor']);
      const body = await req.json();
      const validation = UpdateServiceSchema.safeParse(body);
      if (!validation.success) {
        throw new BadRequestError('Validation failed', validation.error.format());
      }
      const { ipAddress, userAgent } = this.getContext(req);
      const service = await this.servicesUseCase.updateService(user.userId, serviceId, validation.data, ipAddress, userAgent);
      return ApiResponse.success(service, 'Service item updated successfully');
    } catch (error) {
      return ApiResponse.handle(error);
    }
  }

  static async deleteService(req: NextRequest, serviceId: string) {
    try {
      const user = await AuthMiddleware.authorize(req, ['vendor']);
      const { ipAddress, userAgent } = this.getContext(req);
      const service = await this.servicesUseCase.deleteService(user.userId, serviceId, ipAddress, userAgent);
      return ApiResponse.success(service, 'Service item deleted successfully');
    } catch (error) {
      return ApiResponse.handle(error);
    }
  }

  // --- KYC Documents & Verification Status Endpoints ---

  static async getKycStatus(req: NextRequest) {
    try {
      const user = await AuthMiddleware.authorize(req, ['vendor', 'admin']);
      const kycStatus = await this.kycUseCase.getKycStatus(user.userId);
      return ApiResponse.success(kycStatus, 'KYC document verification status fetched');
    } catch (error) {
      return ApiResponse.handle(error);
    }
  }

  static async uploadKycDocument(req: NextRequest) {
    try {
      const user = await AuthMiddleware.authorize(req, ['vendor']);
      const body = await req.json();
      const validation = SubmitKycDocsSchema.safeParse(body);
      if (!validation.success) {
        throw new BadRequestError('Validation failed', validation.error.format());
      }
      const { ipAddress, userAgent } = this.getContext(req);
      const document = await this.kycUseCase.uploadDocument(user.userId, validation.data, ipAddress, userAgent);
      return ApiResponse.success(document, 'KYC document sheet uploaded successfully', 201);
    } catch (error) {
      return ApiResponse.handle(error);
    }
  }

  static async updateKycStatus(req: NextRequest) {
    try {
      const user = await AuthMiddleware.authorize(req, ['admin']);
      const body = await req.json();
      const validation = UpdateKycStatusSchema.safeParse(body);
      if (!validation.success) {
        throw new BadRequestError('Validation failed', validation.error.format());
      }
      const { ipAddress, userAgent } = this.getContext(req);
      const result = await this.kycUseCase.updateStatus(user.userId, validation.data, ipAddress, userAgent);
      return ApiResponse.success(result, 'Vendor verification status updated by admin successfully');
    } catch (error) {
      return ApiResponse.handle(error);
    }
  }
}
