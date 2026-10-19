import React from 'react';
import {
  CategoryAgricultureIcon,
  CategoryAutoIcon,
  CategoryBeautyIcon,
  CategoryBooksIcon,
  CategoryConstructionIcon,
  CategoryDairyIcon,
  CategoryEducationIcon,
  CategoryElectricalIcon,
  CategoryEventsIcon,
  CategoryFitnessIcon,
  CategoryFoodIcon,
  CategoryGardeningIcon,
  CategoryHealthIcon,
  CategoryHomeIcon,
  CategoryLogisticsIcon,
  CategoryPetsIcon,
  CategoryPhotographyIcon,
  CategoryProfessionalIcon,
  CategorySecurityIcon,
  CategoryShoppingIcon,
} from '../components/common/CategoryIcons';

const iconMap: Record<string, React.FC<any>> = {
  utensils: CategoryFoodIcon,
  food: CategoryFoodIcon,
  categoryfoodicon: CategoryFoodIcon,
  scissors: CategoryBeautyIcon,
  salon: CategoryBeautyIcon,
  sparkles: CategoryBeautyIcon,
  cleaning: CategoryBeautyIcon,
  categorybeautyicon: CategoryBeautyIcon,
  wrench: CategoryHomeIcon,
  repairs: CategoryHomeIcon,
  droplets: CategoryHomeIcon,
  plumbing: CategoryHomeIcon,
  categoryhomeicon: CategoryHomeIcon,
  car: CategoryAutoIcon,
  auto: CategoryAutoIcon,
  categoryautoicon: CategoryAutoIcon,
  zap: CategoryElectricalIcon,
  electric: CategoryElectricalIcon,
  categoryelectricalicon: CategoryElectricalIcon,
  briefcase: CategoryProfessionalIcon,
  legal: CategoryProfessionalIcon,
  categoryprofessionalicon: CategoryProfessionalIcon,
  shoppingbag: CategoryShoppingIcon,
  store: CategoryShoppingIcon,
  categoryshoppingicon: CategoryShoppingIcon,
  heart: CategoryHealthIcon,
  health: CategoryHealthIcon,
  categoryhealthicon: CategoryHealthIcon,
  paintbrush: CategoryConstructionIcon,
  truck: CategoryLogisticsIcon,
  categoryeducationicon: CategoryEducationIcon,
  categorypetsicon: CategoryPetsIcon,
  categoryeventsicon: CategoryEventsIcon,
  categoryfitnessicon: CategoryFitnessIcon,
  categoryagricultureicon: CategoryAgricultureIcon,
  categorygardeningicon: CategoryGardeningIcon,
  categoryphotographyicon: CategoryPhotographyIcon,
  categorysecurityicon: CategorySecurityIcon,
  categorydairyicon: CategoryDairyIcon,
  categorybooksicon: CategoryBooksIcon,
};

export function resolveCategoryIcon(iconName?: string, slug?: string) {
  const keys = [iconName, slug]
    .filter(Boolean)
    .map((value) => String(value).toLowerCase().replace(/[^a-z0-9]/g, ''));
  for (const key of keys) {
    if (iconMap[key]) return iconMap[key];
  }
  return CategoryShoppingIcon;
}
