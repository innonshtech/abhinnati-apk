import axios from 'axios';
import { mockDb } from './mockDb';
import { Area } from './mockData';
import { apiClient, USE_MOCK_API } from './client';

// Configurable API key (Google Places API)
// If left empty, the service falls back to mock autocomplete and details search
export const GOOGLE_PLACES_API_KEY = ''; 

export interface LocationSuggestion {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
  isMock?: boolean;
}

export interface LocationDetails {
  placeId: string;
  description: string;
  locality: string;
  city: string;
  latitude: number;
  longitude: number;
}

/**
 * Computes Levenshtein distance between two strings.
 */
function getLevenshteinDistance(s1: string, s2: string): number {
  const m = s1.length;
  const n = s2.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1].toLowerCase() === s2[j - 1].toLowerCase()) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,    // Deletion
          dp[i][j - 1] + 1,    // Insertion
          dp[i - 1][j - 1] + 1 // Substitution
        );
      }
    }
  }
  return dp[m][n];
}

/**
 * Calculate match score for local search matching.
 * Higher scores mean stronger matches. Returns 0 for no match.
 */
function calculateMatchScore(query: string, area: Area): number {
  const q = query.toLowerCase().trim();
  if (!q) return 0;

  const nameEn = area.name_en.toLowerCase();
  const nameMr = area.name_mr.toLowerCase();
  const locality = (area.locality || '').toLowerCase();
  const city = (area.city || '').toLowerCase();

  // 1. Exact or prefix match
  if (nameEn.startsWith(q) || nameMr.startsWith(q)) return 1.0;
  if (locality.startsWith(q) || city.startsWith(q)) return 0.9;

  // 2. Substring matching
  if (nameEn.includes(q) || nameMr.includes(q)) return 0.8;
  if (locality.includes(q) || city.includes(q)) return 0.7;

  // 3. Fuzzy Levenshtein match on words
  const words = [
    ...nameEn.split(/[\s,()]+/),
    ...nameMr.split(/[\s,()]+/),
    ...locality.split(/[\s,()]+/),
    ...city.split(/[\s,()]+/)
  ].filter(w => w.length >= 3);

  let bestWordScore = 0;
  for (const word of words) {
    const dist = getLevenshteinDistance(q, word);
    const maxLen = Math.max(q.length, word.length);
    const similarity = 1 - dist / maxLen;
    if (similarity > bestWordScore) {
      bestWordScore = similarity;
    }
  }

  // If similarity is above threshold (e.g. 70%), return it
  if (bestWordScore >= 0.7) {
    return bestWordScore * 0.6; // Scale down fuzzy matches
  }

  return 0;
}

export const locationService = {
  /**
   * Fetch autocomplete suggestions.
   * If GOOGLE_PLACES_API_KEY is configured, calls Google Places API.
   * Otherwise, runs fuzzy/partial search on local operational areas.
   */
  searchLocations: async (query: string): Promise<LocationSuggestion[]> => {
    if (!query || query.trim().length === 0) {
      return [];
    }

    if (!USE_MOCK_API) {
      try {
        const response = await apiClient.get('/areas/search', { params: { q: query } });
        if (response.data && response.data.success && response.data.data) {
          return response.data.data.map((area: any) => {
            const mainText = area.name_en || area.name;
            const secondaryText = `${area.city || ''}, ${area.state || ''}, ${area.pincode || ''}`.trim().replace(/^,\s*|,\s*$/, '');
            return {
              placeId: area.id,
              description: area.name_en || area.name,
              mainText,
              secondaryText,
              isMock: false
            };
          });
        }
      } catch (error) {
        console.error('Error searching locations from API:', error);
      }
    }

    // Simulate network delay
    await new Promise(r => setTimeout(r, 400));

    if (GOOGLE_PLACES_API_KEY) {
      try {
        const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
          query
        )}&components=country:in&types=geocode&key=${GOOGLE_PLACES_API_KEY}`;
        const response = await axios.get(url);
        
        if (response.data.status === 'OK' && response.data.predictions) {
          return response.data.predictions.map((p: any) => ({
            placeId: p.place_id,
            description: p.description,
            mainText: p.structured_formatting?.main_text || p.description,
            secondaryText: p.structured_formatting?.secondary_text || '',
            isMock: false,
          }));
        } else if (response.data.status === 'ZERO_RESULTS') {
          return [];
        }
        console.warn('Google Places API returned status:', response.data.status);
      } catch (error) {
        console.error('Error fetching Google Places Autocomplete:', error);
        // Fallback to mock search on error
      }
    }

    // Fallback Local/API Search
    let areas: Area[] = [];
    try {
      if (USE_MOCK_API) {
        areas = await mockDb.getAreas();
      } else {
        const response = await apiClient.get('/areas');
        areas = response.data.data || response.data;
      }
    } catch (e) {
      console.error('Error loading areas for location autocomplete fallback:', e);
      areas = await mockDb.getAreas();
    }
    const scored = areas
      .map(area => ({
        area,
        score: calculateMatchScore(query, area)
      }))
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score);

    return scored.map(({ area }) => {
      const mainText = area.locality || area.name_en.split('(')[0].trim();
      const secondaryText = area.city 
        ? `${area.city}, Maharashtra, India` 
        : 'Maharashtra, India';

      return {
        placeId: area.id,
        description: area.name_en,
        mainText,
        secondaryText,
        isMock: true
      };
    });
  },

  /**
   * Fetch place details (coordinates, city, locality).
   * If GOOGLE_PLACES_API_KEY is configured, calls Google Places Details API.
   * Otherwise, retrieves the matching operational area from the database.
   */
  getLocationDetails: async (placeId: string): Promise<LocationDetails> => {
    if (!USE_MOCK_API) {
      try {
        const response = await apiClient.get(`/areas/${placeId}`);
        if (response.data && response.data.success && response.data.data) {
          const area = response.data.data;
          return {
            placeId: area.id,
            description: area.name_en || area.name,
            locality: area.name_en || area.name,
            city: area.city || '',
            latitude: area.latitude,
            longitude: area.longitude
          };
        }
      } catch (error) {
        console.error('Error getting location details from API:', error);
      }
    }

    if (GOOGLE_PLACES_API_KEY && !placeId.startsWith('area-')) {
      try {
        const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=geometry,address_components,formatted_address&key=${GOOGLE_PLACES_API_KEY}`;
        const response = await axios.get(url);
        
        if (response.data.status === 'OK' && response.data.result) {
          const result = response.data.result;
          const lat = result.geometry.location.lat;
          const lng = result.geometry.location.lng;
          const addressComponents = result.address_components || [];
          
          let locality = '';
          let city = '';
          
          for (const comp of addressComponents) {
            const types = comp.types || [];
            if (types.includes('sublocality_level_1') || types.includes('sublocality') || types.includes('neighborhood')) {
              locality = comp.long_name;
            } else if (types.includes('locality') && !locality) {
              locality = comp.long_name;
            }
            
            if (types.includes('administrative_area_level_2') || (types.includes('locality') && !city)) {
              city = comp.long_name;
            }
          }
          
          if (locality === city) {
            locality = '';
          }

          return {
            placeId,
            description: result.formatted_address || result.name,
            locality: locality || result.name,
            city: city || 'Unknown City',
            latitude: lat,
            longitude: lng,
          };
        }
      } catch (error) {
        console.error('Error fetching Google Places details:', error);
      }
    }

    // Local/API Database Fallback
    let areas: Area[] = [];
    try {
      if (USE_MOCK_API) {
        areas = await mockDb.getAreas();
      } else {
        const response = await apiClient.get('/areas');
        areas = response.data.data || response.data;
      }
    } catch (e) {
      console.error('Error loading areas for location details fallback:', e);
      areas = await mockDb.getAreas();
    }
    const area = areas.find(a => a.id === placeId);
    
    if (area) {
      return {
        placeId: area.id,
        description: area.name_en,
        locality: area.locality || area.name_en.split('(')[0].trim(),
        city: area.city || 'Pune',
        latitude: area.latitude,
        longitude: area.longitude
      };
    }

    // Default Fallback
    return {
      placeId,
      description: 'Custom Location, India',
      locality: 'Custom Locality',
      city: 'Pune',
      latitude: 18.5204,
      longitude: 73.8567
    };
  },

  /**
   * Get device GPS + reverse geocode. Delegates to geoService for real
   * GPS coordinates and Nominatim address lookup.
   * Returns LocationDetails for backwards compatibility with existing callers.
   */
  getCurrentLocation: async (prompt = true): Promise<LocationDetails> => {
    try {
      // Import geoService inline to avoid circular dependency
      const { geoService } = await import('./geoService');
      const result = await geoService.getCurrentLocation(prompt);

      if (result.success && result.latitude !== null && result.longitude !== null) {
        const locality = result.localityLabel || result.address?.city || 'Unknown Area';
        const city = result.address?.city || result.address?.state || 'India';
        const displayName = result.address?.display_name || `${locality}, ${city}`;

        return {
          placeId: `gps_${result.latitude.toFixed(5)}_${result.longitude.toFixed(5)}`,
          description: displayName,
          locality,
          city,
          latitude: result.latitude,
          longitude: result.longitude,
        };
      }
    } catch (err) {
      console.error('[locationService] geoService error:', err);
    }

    // Fallback: hardcoded Kothrud for emulator/simulator testing
    return {
      placeId: 'area-kothrud',
      description: 'Kothrud, Pune, Maharashtra, India',
      locality: 'Kothrud',
      city: 'Pune',
      latitude: 18.5074,
      longitude: 73.8077,
    };
  },
};
