import { useState, useEffect, useCallback } from 'react';
import { Area } from '../../../api/mockData';
import locationService from '../services/LocationService';
import { geoService } from '../../../api/geoService';

export interface UseAreaSearchReturn {
  searchText: string;
  setSearchText: (text: string) => void;
  selectedArea: Area | null;
  setSelectedArea: (area: Area | null) => void;
  currentCoordinates: { latitude: number; longitude: number } | null;
  permissionStatus: 'granted' | 'denied' | 'prompt' | 'unknown' | null;
  suggestions: Area[];
  operationalAreas: Area[];
  loading: boolean;
  gpsLoading: boolean;
  error: string | null;
  setError: (err: string | null) => void;
  handleGpsFetch: () => Promise<void>;
}

export const useAreaSearch = (initialSelectedArea: Area | null = null): UseAreaSearchReturn => {
  const [searchText, setSearchTextState] = useState('');
  const [selectedArea, setSelectedArea] = useState<Area | null>(initialSelectedArea);
  const [currentCoordinates, setCurrentCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'prompt' | 'unknown' | null>(null);
  
  const [suggestions, setSuggestions] = useState<Area[]>([]);
  const [operationalAreas, setOperationalAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize operational areas
  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const areas = await locationService.getOperationalAreas();
        setOperationalAreas(areas);
        
        // Setup initial default selection if none exists
        if (!selectedArea && areas.length > 0) {
          const defaultArea = areas.find(a => a.id === 'area-ravet') || areas[0];
          setSelectedArea(defaultArea);
        }
      } catch (err) {
        console.error('[useAreaSearch] Error initializing operational areas:', err);
      }
    };
    fetchAreas();
  }, []);

  // Debounced search trigger (300ms)
  useEffect(() => {
    // If search text is empty, clear suggestions and stop loading
    if (!searchText.trim()) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    // Skip autocomplete if it starts with the GPS or matches the selected locality to prevent recursive loops
    if (selectedArea && (searchText === selectedArea.name_en || searchText === selectedArea.name_mr)) {
      setSuggestions([selectedArea]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const delayTimer = setTimeout(async () => {
      try {
        const results = await locationService.searchAreas(searchText);
        setSuggestions(results);
      } catch (err) {
        console.error('[useAreaSearch] Search error:', err);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayTimer);
  }, [searchText, selectedArea]);

  // Clean search input update handler
  const setSearchText = useCallback((text: string) => {
    setSearchTextState(text);
    if (error) setError(null);
  }, [error]);

  // GPS geolocation flow
  const handleGpsFetch = async () => {
    setGpsLoading(true);
    setError(null);

    try {
      // geoService requests permissions & fetches location details using reverse-geocoding Nominatim
      const result = await geoService.getCurrentLocation(true);

      if (result.error === 'permission_denied') {
        setPermissionStatus('denied');
        setError('Location permission is required to detect your area.');
        setGpsLoading(false);
        return;
      }

      if (!result.success || result.latitude === null || result.longitude === null) {
        setError(result.errorMessage || "Couldn't detect your location. Search manually.");
        setGpsLoading(false);
        return;
      }

      setPermissionStatus('granted');
      setCurrentCoordinates({
        latitude: result.latitude,
        longitude: result.longitude,
      });

      const locality = result.localityLabel || 'Detected Location';
      const city = result.address?.city || '';

      // Auto-fill input text directly without emoji prefix (user request)
      setSearchTextState(locality);

      // Find if this coordinates/name matches a pre-existing operational area
      const matchedArea = operationalAreas.find((a) => {
        // Name-based matches
        if (a.name_en.toLowerCase() === locality.toLowerCase() || a.name_mr.toLowerCase() === locality.toLowerCase()) {
          return true;
        }
        // Latitude-Longitude radius match (approx. 5km)
        const latDiff = Math.abs(a.latitude - result.latitude!);
        const lonDiff = Math.abs(a.longitude - result.longitude!);
        return latDiff < 0.05 && lonDiff < 0.05;
      });

      if (matchedArea) {
        setSelectedArea(matchedArea);
      } else {
        // Create new custom dynamic Area object
        const customArea: Area = {
          id: `gps_${result.latitude.toFixed(5)}_${result.longitude.toFixed(5)}`,
          name_en: locality,
          name_mr: locality,
          latitude: result.latitude,
          longitude: result.longitude,
          radius_km: 5.0,
          locality,
          city,
        };
        setSelectedArea(customArea);
      }
    } catch (err) {
      console.error('[useAreaSearch] GPS fetch critical error:', err);
      setError("Couldn't detect your location. Search manually.");
    } finally {
      setGpsLoading(false);
    }
  };

  return {
    searchText,
    setSearchText,
    selectedArea,
    setSelectedArea,
    currentCoordinates,
    permissionStatus,
    suggestions,
    operationalAreas,
    loading,
    gpsLoading,
    error,
    setError,
    handleGpsFetch,
  };
};

export default useAreaSearch;
