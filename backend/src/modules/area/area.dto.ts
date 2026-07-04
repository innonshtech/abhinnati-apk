export interface AreaResponseDto {
  id: string;
  name: string;
  name_en: string;
  name_mr: string;
  slug: string;
  pincode: string;
  city: string;
  district: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  searchCount: number;
  isActive: boolean;
  distance?: number; // Distance in km (if calculated)
  aliases?: string[];
}

export interface StandardApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
}
