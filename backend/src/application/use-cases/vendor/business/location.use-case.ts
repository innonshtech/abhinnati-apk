import { BusinessRepository } from '../../../../domain/repositories/business.repository';
import { VendorRepository } from '../../../../domain/repositories/vendor.repository';
import { LocationRepository } from '../../../../domain/repositories/location.repository';
import { AuditLogRepository } from '../../../../domain/repositories/audit-log.repository';
import { UpdateLocationRequest } from '../../../dtos/vendor.dto';
import { NotFoundError } from '../../../../presentation/utils/response';
import { prisma } from '../../../../../lib/prisma';

export class LocationUseCase {
  constructor(
    private businessRepo: BusinessRepository,
    private vendorRepo: VendorRepository,
    private locationRepo: LocationRepository,
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

  async getBusinessLocation(userId: string) {
    const { business } = await this.getVendorAndBusiness(userId);
    const locations = await this.locationRepo.findByBusinessId(business.id);
    return locations.length > 0 ? locations[0] : null;
  }

  async updateLocation(userId: string, dto: UpdateLocationRequest, ipAddress?: string, userAgent?: string) {
    const { business } = await this.getVendorAndBusiness(userId);
    const locations = await this.locationRepo.findByBusinessId(business.id);

    let location;
    if (locations.length > 0) {
      // 1. Update existing location record
      location = await this.locationRepo.update(locations[0].id, {
        latitude: dto.latitude,
        longitude: dto.longitude,
        formattedAddress: dto.formattedAddress,
        city: dto.city,
        state: dto.state,
        pincode: dto.pincode,
        area: dto.area,
      });
    } else {
      // 2. Create new location record
      location = await this.locationRepo.create({
        businessId: business.id,
        latitude: dto.latitude,
        longitude: dto.longitude,
        formattedAddress: dto.formattedAddress,
        city: dto.city,
        state: dto.state,
        pincode: dto.pincode,
        area: dto.area,
      });
    }

    await this.auditRepo.create({
      userId,
      action: 'UPDATE_LOCATION',
      entityName: 'Location',
      entityId: location.id,
      newValues: JSON.stringify(location),
      ipAddress,
      userAgent,
    });

    return location;
  }

  async reverseGeocode(latitude: number, longitude: number) {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.warn('[LocationUseCase] GOOGLE_MAPS_API_KEY not configured. Falling back to mock address.');
      return {
        formattedAddress: 'Hill Road, Bandra West, Mumbai, Maharashtra 400050',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400050',
        area: 'Bandra West',
      };
    }

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`
      );
      const data = await response.json();

      if (data.status === 'OK' && data.results.length > 0) {
        const result = data.results[0];
        let city = '';
        let state = '';
        let pincode = '';
        let area = '';

        for (const component of result.address_components) {
          if (component.types.includes('locality')) {
            city = component.long_name;
          }
          if (component.types.includes('administrative_area_level_1')) {
            state = component.long_name;
          }
          if (component.types.includes('postal_code')) {
            pincode = component.long_name;
          }
          if (component.types.includes('sublocality_level_1') || component.types.includes('neighborhood')) {
            area = component.long_name;
          }
        }

        return {
          formattedAddress: result.formatted_address,
          city: city || 'Mumbai',
          state: state || 'Maharashtra',
          pincode: pincode || '400050',
          area: area || 'Bandra West',
        };
      }
      throw new Error(`Geocoding error: ${data.status}`);
    } catch (error) {
      console.error('[LocationUseCase] Error reverse geocoding:', error);
      throw error;
    }
  }

  /**
   * Search for nearby businesses using a simple bounding box calculation.
   */
  async searchNearby(latitude: number, longitude: number, radiusKm = 5.0) {
    // 1 degree latitude = ~111km
    const latDelta = radiusKm / 111.0;
    // 1 degree longitude = ~111km * cos(lat)
    const lonDelta = radiusKm / (111.0 * Math.cos((latitude * Math.PI) / 180.0));

    const minLat = latitude - latDelta;
    const maxLat = latitude + latDelta;
    const minLon = longitude - lonDelta;
    const maxLon = longitude + lonDelta;

    const nearbyLocations = await prisma.location.findMany({
      where: {
        latitude: { gte: minLat, lte: maxLat },
        longitude: { gte: minLon, lte: maxLon },
        deletedAt: null,
      },
      include: {
        business: {
          include: {
            vendor: true,
          },
        },
      },
    });

    return nearbyLocations.map((loc) => ({
      businessId: loc.businessId,
      nameMr: loc.business.nameMr,
      nameEn: loc.business.nameEn,
      latitude: loc.latitude,
      longitude: loc.longitude,
      formattedAddress: loc.formattedAddress,
      serviceRadius: loc.business.serviceRadius,
      ratingAvg: loc.business.ratingAvg,
      reviewsCount: loc.business.reviewsCount,
    }));
  }
}
