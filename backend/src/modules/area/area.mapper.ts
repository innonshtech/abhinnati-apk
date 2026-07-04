import { Area, AreaAlias } from '@prisma/client';
import { AreaResponseDto } from './area.dto';

export class AreaMapper {
  static toDto(area: Area & { aliases?: AreaAlias[] }, distance?: number): AreaResponseDto {
    return {
      id: area.id,
      name: area.name,
      name_en: area.name, // Backward compatibility for mobile client
      name_mr: area.name, // Backward compatibility for mobile client
      slug: area.slug,
      pincode: area.pincode,
      city: area.city,
      district: area.district,
      state: area.state,
      country: area.country,
      latitude: area.latitude,
      longitude: area.longitude,
      searchCount: area.searchCount,
      isActive: area.isActive,
      distance: distance !== undefined ? parseFloat(distance.toFixed(2)) : undefined,
      aliases: area.aliases ? area.aliases.map((a) => a.aliasName) : [],
    };
  }

  static toDtoList(areas: Array<Area & { aliases?: AreaAlias[] }>): AreaResponseDto[] {
    return areas.map((area) => this.toDto(area));
  }
}
