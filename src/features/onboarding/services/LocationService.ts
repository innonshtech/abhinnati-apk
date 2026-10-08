import { api } from '../../../api/client';
import { Area } from '../../../api/mockData';

export interface AreaMetadata {
  id: string;
  name_en: string;
  name_mr: string;
  pincode: string;
  city: string;
  latitude: number;
  longitude: number;
  radius_km: number;
  aliases: string[];
  landmarks: string[];
}

// Rich dataset matching the spec requirements
export const richSearchDataset: AreaMetadata[] = [
  {
    id: 'area-baner',
    name_en: 'Baner',
    name_mr: 'बाणेर',
    pincode: '411045',
    city: 'Pune',
    latitude: 18.5590,
    longitude: 73.7868,
    radius_km: 4.0,
    aliases: ['Baner Road', 'Balewadi High Street', 'Baner-Pashan Link Road'],
    landmarks: ['Balewadi Stadium', 'Omnispace', 'Westend Mall'],
  },
  {
    id: 'area-hinjewadi-1',
    name_en: 'Hinjawadi Phase 1',
    name_mr: 'हिंजवडी फेज १',
    pincode: '411057',
    city: 'Pune',
    latitude: 18.5913,
    longitude: 73.7389,
    radius_km: 5.0,
    aliases: ['Hinjewadi Phase 1', 'Hinjewadi P1', 'Hinjawadi IT Park'],
    landmarks: ['Infosys Circle', 'Wipro Phase 1', 'Quadron IT Park'],
  },
  {
    id: 'area-hinjewadi-2',
    name_en: 'Hinjawadi Phase 2',
    name_mr: 'हिंजवडी फेज २',
    pincode: '411057',
    city: 'Pune',
    latitude: 18.5930,
    longitude: 73.7220,
    radius_km: 5.0,
    aliases: ['Hinjewadi Phase 2', 'Hinjewadi P2'],
    landmarks: ['Embassy Techzone', 'Cognizant Phase 2'],
  },
  {
    id: 'area-hinjewadi-3',
    name_en: 'Hinjawadi Phase 3',
    name_mr: 'हिंजवडी फेज ३',
    pincode: '411057',
    city: 'Pune',
    latitude: 18.5850,
    longitude: 73.6990,
    radius_km: 5.0,
    aliases: ['Hinjewadi Phase 3', 'Hinjewadi P3'],
    landmarks: ['TCS Phase 3', 'Tech Mahindra'],
  },
  {
    id: 'area-pimple-saudagar',
    name_en: 'Pimple Saudagar',
    name_mr: 'पिंपळे सौदागर',
    pincode: '411027',
    city: 'Pune',
    latitude: 18.5985,
    longitude: 73.7997,
    radius_km: 4.0,
    aliases: ['Saudagar', 'Pimple Saudagar Road'],
    landmarks: ['Govind Garden', 'Shivar Garden'],
  },
  {
    id: 'area-pimple-gurav',
    name_en: 'Pimple Gurav',
    name_mr: 'पिंपळे गुरव',
    pincode: '411061',
    city: 'Pune',
    latitude: 18.5866,
    longitude: 73.8188,
    radius_km: 4.0,
    aliases: ['Gurav', 'Pimple Gurav Area'],
    landmarks: ['Dinosaur Park', 'Kate Puram Chowk'],
  },
  {
    id: 'area-bandra-west',
    name_en: 'Bandra West',
    name_mr: 'वांद्रे पश्चिम',
    pincode: '400050',
    city: 'Mumbai',
    latitude: 19.0596,
    longitude: 72.8295,
    radius_km: 3.0,
    aliases: ['Bandra West', 'Bandra W', 'Bandra W Road', 'Carter Road', 'Linking Road'],
    landmarks: ['Bandstand', 'Mount Mary Basilica', 'Bandra Fort'],
  },
  {
    id: 'area-bandra-east',
    name_en: 'Bandra East',
    name_mr: 'वांद्रे पूर्व',
    pincode: '400051',
    city: 'Mumbai',
    latitude: 19.0620,
    longitude: 72.8464,
    radius_km: 3.0,
    aliases: ['Bandra East', 'Bandra E', 'BKC', 'Bandra Kurla Complex'],
    landmarks: ['MMRDA Grounds', 'MIG Club'],
  },
  {
    id: 'area-banjara-hills',
    name_en: 'Banjara Hills',
    name_mr: 'बंजारा हिल्स',
    pincode: '500034',
    city: 'Hyderabad',
    latitude: 17.4156,
    longitude: 78.4347,
    radius_km: 4.0,
    aliases: ['Banjara Hills Road', 'Road No 1 Banjara Hills'],
    landmarks: ['GVK One Mall', 'Taj Krishna'],
  },
  {
    id: 'area-khar',
    name_en: 'Khar',
    name_mr: 'खार',
    pincode: '400052',
    city: 'Mumbai',
    latitude: 19.0700,
    longitude: 72.8350,
    radius_km: 3.0,
    aliases: ['Khar Road', 'Khar West', 'Khar Gymkhana'],
    landmarks: ['Carter Road Promenade', 'Olive Bar'],
  },
  {
    id: 'area-santacruz',
    name_en: 'Santacruz',
    name_mr: 'सांताक्रूझ',
    pincode: '400054',
    city: 'Mumbai',
    latitude: 19.0800,
    longitude: 72.8400,
    radius_km: 3.0,
    aliases: ['Santacruz West', 'Santacruz East', 'Vakola'],
    landmarks: ['Domestic Airport T1', 'Grand Hyatt'],
  },
  {
    id: 'area-kothrud',
    name_en: 'Kothrud',
    name_mr: 'कोथरूड',
    pincode: '411038',
    city: 'Pune',
    latitude: 18.5074,
    longitude: 73.8077,
    radius_km: 5.0,
    aliases: ['Kothrud Stand', 'Karve Road', 'Paud Road'],
    landmarks: ['Mrutyunjay Temple', 'MIT College', 'Vanaz Metro Station'],
  },
  {
    id: 'area-deccan',
    name_en: 'Deccan Gymkhana',
    name_mr: 'डेक्कन जिमखाना',
    pincode: '411004',
    city: 'Pune',
    latitude: 18.5186,
    longitude: 73.8417,
    radius_km: 4.0,
    aliases: ['Deccan', 'FC Road', 'Fergusson College Road', 'Jangali Maharaj Road', 'JM Road'],
    landmarks: ['Goodluck Cafe', 'Fergusson College', 'Sambhaji Park'],
  },
];

export interface LocationService {
  searchAreas(query: string): Promise<Area[]>;
  getOperationalAreas(): Promise<Area[]>;
}

export const locationServiceWrapper: LocationService = {
  searchAreas: async (query: string): Promise<Area[]> => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    try {
      // 1. Search locally in operational areas first
      const areas = await locationServiceWrapper.getOperationalAreas();
      const localMatches = areas.filter((area) => {
        const nameEn = (area.name_en || '').toLowerCase();
        const nameMr = (area.name_mr || '').toLowerCase();
        const city = (area.city || '').toLowerCase();
        const locality = (area.locality || '').toLowerCase();
        
        return (
          nameEn.includes(q) ||
          nameMr.includes(q) ||
          city.includes(q) ||
          locality.includes(q)
        );
      });

      // If we found local matches, return them immediately
      if (localMatches.length > 0) {
        return localMatches;
      }

      // 2. If no local match, fetch real-world data from Nominatim (OpenStreetMap)
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&addressdetails=1&countrycodes=in&limit=5`;
      const response = await fetch(url, { headers: { 'User-Agent': 'AbhinnatiiApp/1.0' } });
      const data = await response.json();
      
      if (data && Array.isArray(data)) {
        return data.map((item: any) => {
          const lat = parseFloat(item.lat);
          const lon = parseFloat(item.lon);
          const locality = item.address?.suburb || item.address?.neighbourhood || item.address?.city_district || item.name;
          const city = item.address?.city || item.address?.town || item.address?.village || '';
          
          return {
            id: `nominatim_${lat.toFixed(5)}_${lon.toFixed(5)}`,
            name_en: locality,
            name_mr: locality,
            latitude: lat,
            longitude: lon,
            radius_km: 5.0,
            locality: locality,
            city: city,
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
      if (dbAreas && dbAreas.length > 0) {
        return dbAreas;
      }
    } catch (err) {
      console.warn('[LocationService] API error fetching areas, falling back to local dataset:', err);
    }

    // Local fallback
    return richSearchDataset.map((m) => ({
      id: m.id,
      name_en: m.name_en,
      name_mr: m.name_mr,
      latitude: m.latitude,
      longitude: m.longitude,
      radius_km: m.radius_km,
      locality: m.name_en,
      city: m.city,
    }));
  },
};

export default locationServiceWrapper;
