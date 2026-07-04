import { ExploreRepository } from './explore.repository';
import {
  toAreaDTO,
  toCategoryDTO,
  toBusinessSummaryDTO,
  toBusinessDetailDTO,
  BusinessSummaryDTO,
} from './explore.dto';

export class ExploreService {
  private exploreRepository = new ExploreRepository();

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  async getExploreData(userId: string) {
    const user = await this.exploreRepository.findUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const activeArea = user.activeArea;
    const categories = await this.exploreRepository.findAllCategories();

    // Fetch popular and nearby businesses near the user (within 5.0 km)
    let popularBusinesses: any[] = [];
    let nearbyBusinesses: any[] = [];

    if (activeArea) {
      const allApproved = await this.exploreRepository.findApprovedVendors();
      
      const mappedApproved = allApproved.map((vendor) => {
        const distanceVal = this.calculateDistance(
          activeArea.latitude,
          activeArea.longitude,
          vendor.latitude,
          vendor.longitude
        );
        return { ...vendor, distanceVal };
      }).filter((vendor) => vendor.distanceVal <= 5.0);

      // Popular: sorted by ratingAvg descending, then distance ascending
      popularBusinesses = [...mappedApproved]
        .sort((a, b) => {
          if (b.ratingAvg !== a.ratingAvg) {
            return b.ratingAvg - a.ratingAvg;
          }
          return a.distanceVal - b.distanceVal;
        })
        .slice(0, 10);

      // Nearby: sorted purely by distance ascending
      nearbyBusinesses = [...mappedApproved]
        .sort((a, b) => a.distanceVal - b.distanceVal)
        .slice(0, 10);
    }

    const featuredBusinesses = popularBusinesses.slice(0, 3);

    return {
      area: activeArea ? toAreaDTO(activeArea) : null,
      categories: await Promise.all(
        categories.map(async (cat) => {
          const count = await this.exploreRepository.countVendorsInCategory(cat.slug);
          return toCategoryDTO(cat, count);
        })
      ),
      popularBusinesses: popularBusinesses.map(toBusinessSummaryDTO),
      nearbyBusinesses: nearbyBusinesses.map(toBusinessSummaryDTO),
      featuredBusinesses: featuredBusinesses.map(toBusinessSummaryDTO),
    };
  }

  async searchMarketplace(
    query: string,
    areaId: string,
    sortBy: 'distance' | 'popularity' | 'none' = 'distance',
    page = 1,
    limit = 10
  ) {
    const targetArea = await this.exploreRepository.findAreaById(areaId);
    if (!targetArea) {
      throw new Error('Selected area not found');
    }

    const allApproved = await this.exploreRepository.findApprovedVendors();
    const q = query.toLowerCase().trim();

    const matched = allApproved
      .map((vendor) => {
        const distanceVal = this.calculateDistance(
          targetArea.latitude,
          targetArea.longitude,
          vendor.latitude,
          vendor.longitude
        );
        return { ...vendor, distanceVal };
      })
      .filter((vendor) => {
        const nameEn = vendor.businessNameEn.toLowerCase();
        const nameMr = vendor.businessNameMr.toLowerCase();
        const descEn = vendor.descriptionEn.toLowerCase();
        const descMr = vendor.descriptionMr.toLowerCase();
        const catSlug = vendor.categorySlug.toLowerCase();
        const catNameEn = vendor.categoryNameEn.toLowerCase();
        const catNameMr = vendor.categoryNameMr.toLowerCase();

        return (
          nameEn.includes(q) ||
          nameMr.includes(q) ||
          descEn.includes(q) ||
          descMr.includes(q) ||
          catSlug.includes(q) ||
          catNameEn.includes(q) ||
          catNameMr.includes(q) ||
          vendor.services.some(
            (s) =>
              s.name_en.toLowerCase().includes(q) ||
              s.name_mr.toLowerCase().includes(q)
          )
        );
      });

    if (sortBy === 'popularity') {
      matched.sort((a, b) => {
        if (b.ratingAvg !== a.ratingAvg) {
          return b.ratingAvg - a.ratingAvg;
        }
        if (b.reviewsCount !== a.reviewsCount) {
          return b.reviewsCount - a.reviewsCount;
        }
        return a.distanceVal - b.distanceVal;
      });
    } else if (sortBy === 'distance') {
      matched.sort((a, b) => a.distanceVal - b.distanceVal);
    }

    const total = matched.length;
    const totalPages = Math.ceil(total / limit);
    const paginated = matched.slice((page - 1) * limit, page * limit);

    return {
      businesses: paginated.map(toBusinessSummaryDTO),
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async getCategoriesList() {
    const categories = await this.exploreRepository.findAllCategories();
    return Promise.all(
      categories.map(async (cat) => {
        const count = await this.exploreRepository.countVendorsInCategory(cat.slug);
        return toCategoryDTO(cat, count);
      })
    );
  }

  async getCategoryBusinesses(
    categorySlug: string,
    areaId: string,
    sortBy: 'rating' | 'distance' | 'newest' | 'none' = 'none',
    verifiedOnly = false,
    page = 1,
    limit = 10
  ) {
    const targetArea = await this.exploreRepository.findAreaById(areaId);
    if (!targetArea) {
      throw new Error('Selected area not found');
    }

    const allApproved = await this.exploreRepository.findApprovedVendors();
    let filtered = allApproved
      .filter((v) => v.categorySlug === categorySlug)
      .map((vendor) => {
        const distanceVal = this.calculateDistance(
          targetArea.latitude,
          targetArea.longitude,
          vendor.latitude,
          vendor.longitude
        );
        return { ...vendor, distanceVal };
      });

    if (verifiedOnly) {
      filtered = filtered.filter((v) => v.kycStatus === 'approved');
    }

    if (sortBy === 'rating') {
      filtered.sort((a, b) => b.ratingAvg - a.ratingAvg);
    } else if (sortBy === 'distance') {
      filtered.sort((a, b) => a.distanceVal - b.distanceVal);
    } else if (sortBy === 'newest') {
      filtered.sort((a, b) => {
        const timeA = new Date(a.createdAt).getTime();
        const timeB = new Date(b.createdAt).getTime();
        return timeB - timeA;
      });
    }

    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const paginated = filtered.slice((page - 1) * limit, page * limit);

    return {
      businesses: paginated.map(toBusinessSummaryDTO),
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async getPopularBusinesses(areaId: string) {
    const targetArea = await this.exploreRepository.findAreaById(areaId);
    if (!targetArea) {
      throw new Error('Selected area not found');
    }

    const allApproved = await this.exploreRepository.findApprovedVendors();
    const sorted = allApproved
      .map((vendor) => {
        const distanceVal = this.calculateDistance(
          targetArea.latitude,
          targetArea.longitude,
          vendor.latitude,
          vendor.longitude
        );
        return { ...vendor, distanceVal };
      })
      .sort((a, b) => {
        if (b.ratingAvg !== a.ratingAvg) {
          return b.ratingAvg - a.ratingAvg;
        }
        if (b.reviewsCount !== a.reviewsCount) {
          return b.reviewsCount - a.reviewsCount;
        }
        return a.distanceVal - b.distanceVal;
      });

    return sorted.map(toBusinessSummaryDTO);
  }

  async getBusinessesList(
    areaId: string,
    sortBy: 'rating' | 'distance' | 'newest' | 'none' = 'none',
    verifiedOnly = false,
    minRating = 0,
    page = 1,
    limit = 10
  ) {
    const targetArea = await this.exploreRepository.findAreaById(areaId);
    if (!targetArea) {
      throw new Error('Selected area not found');
    }

    const allApproved = await this.exploreRepository.findApprovedVendors();
    let filtered = allApproved
      .map((vendor) => {
        const distanceVal = this.calculateDistance(
          targetArea.latitude,
          targetArea.longitude,
          vendor.latitude,
          vendor.longitude
        );
        return { ...vendor, distanceVal };
      });

    if (verifiedOnly) {
      filtered = filtered.filter((v) => v.kycStatus === 'approved');
    }

    if (minRating > 0) {
      filtered = filtered.filter((v) => v.ratingAvg >= minRating);
    }

    if (sortBy === 'rating') {
      filtered.sort((a, b) => b.ratingAvg - a.ratingAvg);
    } else if (sortBy === 'distance') {
      filtered.sort((a, b) => a.distanceVal - b.distanceVal);
    } else if (sortBy === 'newest') {
      filtered.sort((a, b) => {
        const timeA = new Date(a.createdAt).getTime();
        const timeB = new Date(b.createdAt).getTime();
        return timeB - timeA;
      });
    }

    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const paginated = filtered.slice((page - 1) * limit, page * limit);

    return {
      businesses: paginated.map(toBusinessSummaryDTO),
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async getBusinessDetail(businessId: string, activeAreaId?: string) {
    const vendor = await this.exploreRepository.findVendorById(businessId);
    if (!vendor) {
      throw new Error('Business not found');
    }

    let distanceVal = 0;
    let activeArea: any = null;
    if (activeAreaId) {
      activeArea = await this.exploreRepository.findAreaById(activeAreaId);
      if (activeArea) {
        distanceVal = this.calculateDistance(
          activeArea.latitude,
          activeArea.longitude,
          vendor.latitude,
          vendor.longitude
        );
      }
    }

    // Load similar businesses algorithm
    const similar = await this.getSimilarBusinesses(vendor.id, vendor.categorySlug, activeArea);

    return toBusinessDetailDTO(vendor, distanceVal, similar);
  }

  private async getSimilarBusinesses(
    currentBusinessId: string,
    categorySlug: string,
    activeArea: any,
    limit = 3
  ): Promise<BusinessSummaryDTO[]> {
    const allApproved = await this.exploreRepository.findApprovedVendors();
    return allApproved
      .filter((v) => v.categorySlug === categorySlug && v.id !== currentBusinessId)
      .map((vendor) => {
        let distanceVal = 0;
        if (activeArea) {
          distanceVal = this.calculateDistance(
            activeArea.latitude,
            activeArea.longitude,
            vendor.latitude,
            vendor.longitude
          );
        }
        return { ...vendor, distanceVal };
      })
      .sort((a, b) => {
        if (b.ratingAvg !== a.ratingAvg) {
          return b.ratingAvg - a.ratingAvg;
        }
        return a.distanceVal - b.distanceVal;
      })
      .slice(0, limit)
      .map(toBusinessSummaryDTO);
  }

  async updateUserActiveArea(userId: string, areaId: string) {
    const area = await this.exploreRepository.findAreaById(areaId);
    if (!area) {
      throw new Error('Selected area not found');
    }

    const updatedUser = await this.exploreRepository.updateUserArea(userId, areaId);
    const exploreData = await this.getExploreData(userId);

    return {
      user: {
        id: updatedUser.id,
        phone: updatedUser.phone,
        name: updatedUser.name,
        activeAreaId: updatedUser.activeAreaId,
        activeArea: updatedUser.activeArea ? toAreaDTO(updatedUser.activeArea) : null,
      },
      explore: exploreData,
    };
  }
}
