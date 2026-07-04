export const AreaConstants = {
  DEFAULT_SEARCH_LIMIT: 10,
  DEFAULT_NEARBY_RADIUS_KM: 5.0,
  MAX_QUERY_LENGTH: 100,
  ERRORS: {
    QUERY_REQUIRED: 'Query parameter q is required',
    QUERY_TOO_LONG: 'Search query is too long (max 100 characters)',
    LATITUDE_REQUIRED: 'Latitude is required',
    LONGITUDE_REQUIRED: 'Longitude is required',
    INVALID_LATITUDE: 'Latitude must be a valid number between -90 and 90',
    INVALID_LONGITUDE: 'Longitude must be a valid number between -180 and 180',
    INVALID_RADIUS: 'Radius must be a positive number',
    INVALID_PINCODE: 'Pincode must be a 6-digit number',
    AREA_NOT_FOUND: 'Area not found',
    SQL_INJECTION_DETECTED: 'Potential SQL injection pattern detected',
  },
};
