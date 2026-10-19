import { api } from '../../../api/client';
import { Area } from '../../../api/mockData';

export interface LocationService {
  searchAreas(query: string): Promise<Area[]>;
  getOperationalAreas(): Promise<Area[]>;
}

function normalizeArea(raw: any): Area {
  return {
    id: raw.id,
    name_en: raw.name_en || raw.nameEn || raw.name || '',
    name_mr: raw.name_mr || raw.nameMr || raw.name_en || raw.nameEn || raw.name || '',
    latitude: Number(raw.latitude) || 0,
    longitude: Number(raw.longitude) || 0,
    radius_km: Number(raw.radius_km ?? raw.radiusKm ?? 5),
    locality: raw.locality || raw.name_en || raw.nameEn || raw.name || '',
    city: raw.city || '',
  };
}

export const locationServiceWrapper: LocationService = {
  searchAreas: async (query: string): Promise<Area[]> => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    try {
      const areas = await locationServiceWrapper.getOperationalAreas();
      const localMatches = areas.filter((area) => {
        const nameEn = (area.name_en || '').toLowerCase();
        const nameMr = (area.name_mr || '').toLowerCase();
        const city = (area.city || '').toLowerCase();
        const locality = (area.locality || '').toLowerCase();
        return nameEn.includes(q) || nameMr.includes(q) || city.includes(q) || locality.includes(q);
      });
      if (localMatches.length > 0) {
        return localMatches;
      }

      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&addressdetails=1&countrycodes=in&limit=5`;
      const response = await fetch(url, { headers: { 'User-Agent': 'AbhinnatiiApp/1.0' } });
      const data = await response.json();

      if (data && Array.isArray(data)) {
        return data.map((item: any) => {
          const lat = parseFloat(item.lat);
          const lon = parseFloat(item.lon);
          const locality =
            item.address?.suburb ||
            item.address?.neighbourhood ||
            item.address?.city_district ||
            item.name;
          const city = item.address?.city || item.address?.town || item.address?.village || '';
          return {
            id: `nominatim_${lat.toFixed(5)}_${lon.toFixed(5)}`,
            name_en: locality,
            name_mr: locality,
            latitude: lat,
            longitude: lon,
            radius_km: 5.0,
            locality,
            city,
          };
        });
      }
      return [];
    } catch (err) {
      console.error('[LocationService] Search areas failed:', err);
      return [];
    }
  },

  getOperationalAreas: async (): Promise<Area[]> => {
    try {
      const dbAreas = await api.getAreas();
      if (Array.isArray(dbAreas) && dbAreas.length > 0) {
        return dbAreas.map(normalizeArea);
      }
    } catch (err) {
      console.warn('[LocationService] API error fetching areas:', err);
    }
    return [];
  },
};

export default locationServiceWrapper;
