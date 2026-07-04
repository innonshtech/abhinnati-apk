import { geoService } from '../../../api/geoService';

export interface GeocodedAddress {
  locality: string;
  city: string;
  pincode?: string;
  displayAddress?: string;
}

export interface ReverseGeocodingService {
  reverseGeocode(latitude: number, longitude: number): Promise<GeocodedAddress | null>;
}

export const reverseGeocodingService: ReverseGeocodingService = {
  reverseGeocode: async (latitude: number, longitude: number): Promise<GeocodedAddress | null> => {
    try {
      // geoService reverseGeocode uses Nominatim to resolve location details
      const result = await geoService.getCurrentLocation(true);
      if (result.success && result.address) {
        return {
          locality: result.localityLabel || result.address.locality || 'Unknown Area',
          city: result.address.city || 'Unknown City',
          pincode: result.address.postcode || undefined,
          displayAddress: result.address.display_name || undefined,
        };
      }
    } catch (err) {
      console.error('[ReverseGeocodingService] Reverse geocode error:', err);
    }
    return null;
  },
};

export default reverseGeocodingService;
