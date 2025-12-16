/*
 *  Copyright 2025 LiteFarm.org
 *  This file is part of LiteFarm.
 *
 *  LiteFarm is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  LiteFarm is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details, see <https://www.gnu.org/licenses/>.
 */

// Central registry for all API tags in the application

/**
 * These tags have endpoints that do not return farm specific data, and are not created by a farm
 *
 *  LiteFarm provides these data as defaults
 */
export const LibraryTags = [
  'AnimalSexes',
  'AnimalIdentifierTypes',
  'AnimalIdentifierColors',
  'AnimalMovementPurposes',
  'AnimalOrigins',
  'AnimalUses',
  'AnimalRemovalReasons',
  'DefaultAnimalBreeds',
  'MarketProductCategories',
  'SoilAmendmentMethods',
  'SoilAmendmentPurposes',
  'SoilAmendmentFertiliserTypes',
] as const;

/**
 * These tags contain endpoints that return farm specific data
 *
 * These data should not persist when switching farms,
 * or should be stored in a separate farm store.
 */
export const FarmTags = [
  'Animals',
  'AnimalBatches',
  'CustomAnimalBreeds',
  'CustomAnimalTypes',
  'FarmAddon',
  'IrrigationPrescriptions',
  'IrrigationPrescriptionDetails',
  'Locations',
  'SoilAmendmentProduct',
  'Sensors',
  'SensorReadings',
  'Weather',
  'MarketDirectoryInfo',
] as const;

/**
 * These tags contain endpoints that could either return farm specific data
 * or farm neutral defaults data.
 *
 * For data safety these data should also not persist when switching farms,
 * or should be stored in a separate farm store.
 */
export const FarmLibraryTags = [
  // 'count' param returns farm specific data
  'DefaultAnimalTypes',
  // result might depend on the farm country
  'MarketDirectoryPartners',
] as const;

export const API_TAGS = [...LibraryTags, ...FarmTags, ...FarmLibraryTags] as const;

export type ApiTag = (typeof API_TAGS)[number];
