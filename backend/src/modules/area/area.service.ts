import { AreaRepository } from './area.repository';
import { AreaMapper } from './area.mapper';
import { AreaResponseDto } from './area.dto';

export class AreaService {
  private areaRepository = new AreaRepository();

  async searchAreas(query: string, limit: number): Promise<AreaResponseDto[]> {
    const queryClean = query.trim().toLowerCase();
    
    // Fetch matching candidates using name, pincode, or aliases
    const candidates = await this.areaRepository.findCandidates(queryClean);

    // Calculate score for each candidate to rank them
    const scoredCandidates = candidates.map((area) => {
      let maxScore = 0;

      // 1. Check primary name
      const nameLower = area.name.toLowerCase();
      if (nameLower === queryClean) {
        maxScore = Math.max(maxScore, 1000);
      } else if (nameLower.startsWith(queryClean)) {
        maxScore = Math.max(maxScore, 500);
      } else if (nameLower.includes(queryClean)) {
        maxScore = Math.max(maxScore, 100);
      }

      // 2. Check pincode
      if (area.pincode === queryClean) {
        maxScore = Math.max(maxScore, 1000);
      } else if (area.pincode.startsWith(queryClean)) {
        maxScore = Math.max(maxScore, 500);
      }

      // 3. Check aliases
      if (area.aliases) {
        for (const alias of area.aliases) {
          const aliasLower = alias.aliasName.toLowerCase();
          if (aliasLower === queryClean) {
            maxScore = Math.max(maxScore, 1000);
          } else if (aliasLower.startsWith(queryClean)) {
            maxScore = Math.max(maxScore, 500);
          } else if (aliasLower.includes(queryClean)) {
            maxScore = Math.max(maxScore, 100);
          }
        }
      }

      // Final rank score with searchCount as tie-breaker
      const rankScore = maxScore + area.searchCount * 0.01;
      return { area, rankScore };
    });

    // Sort by rank score descending, then take the limit
    const sorted = scoredCandidates
      .filter((item) => item.rankScore > 0)
      .sort((a, b) => b.rankScore - a.rankScore)
      .slice(0, limit)
      .map((item) => item.area);

    return AreaMapper.toDtoList(sorted);
  }

  async getNearbyAreas(
    latitude: number,
    longitude: number,
    radiusKm: number,
    limit: number
  ): Promise<AreaResponseDto[]> {
    // Earth's radius and degree conversion formulas
    const latDegreePerKm = 1 / 111.0;
    const lngDegreePerKm = 1 / (111.0 * Math.cos((latitude * Math.PI) / 180));

    // Bounding Box limits for fast indexed querying
    const minLat = latitude - radiusKm * latDegreePerKm;
    const maxLat = latitude + radiusKm * latDegreePerKm;
    const minLng = longitude - radiusKm * lngDegreePerKm;
    const maxLng = longitude + radiusKm * lngDegreePerKm;

    // Fetch candidate areas in bounding box
    const candidates = await this.areaRepository.findInBoundingBox(minLat, maxLat, minLng, maxLng);

    // Exact distance calculation using Haversine formula
    const R = 6371; // Earth radius in km
    const results = candidates
      .map((area) => {
        const dLat = ((area.latitude - latitude) * Math.PI) / 180;
        const dLng = ((area.longitude - longitude) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((latitude * Math.PI) / 180) *
            Math.cos((area.latitude * Math.PI) / 180) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;

        return { area, distance };
      })
      .filter((item) => item.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit);

    return results.map((item) => AreaMapper.toDto(item.area, item.distance));
  }

  async getPopularAreas(limit: number): Promise<AreaResponseDto[]> {
    const areas = await this.areaRepository.findMany({
      where: { isActive: true },
      orderBy: { searchCount: 'desc' },
      take: limit,
    });
    return AreaMapper.toDtoList(areas);
  }

  async getAreaDetails(id: string): Promise<AreaResponseDto | null> {
    const area = await this.areaRepository.findById(id);
    if (!area) return null;

    // Increment selection analytics count asynchronously
    await this.areaRepository.incrementSearchCount(id).catch((err) => {
      console.error(`Failed to increment search count for area ${id}:`, err);
    });

    // Fetch the updated record to return
    const updatedArea = await this.areaRepository.findById(id);
    return updatedArea ? AreaMapper.toDto(updatedArea) : AreaMapper.toDto(area);
  }

  async getAllActiveAreas(): Promise<AreaResponseDto[]> {
    const areas = await this.areaRepository.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
    return AreaMapper.toDtoList(areas);
  }
}
