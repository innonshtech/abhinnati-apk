export interface AreaModel {
  id: string;
  name: string;
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
  createdAt: Date;
  updatedAt: Date;
}

export interface AreaAliasModel {
  id: string;
  areaId: string;
  aliasName: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SearchCriteria {
  q?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  limit?: number;
}
