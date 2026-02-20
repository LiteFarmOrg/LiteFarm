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
  'MarketDirectoryPartners',
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
  'SoilAmendmentProduct',
  'Sensors',
  'SensorReadings',
  'Weather',
  'MarketDirectoryInfo',
] as const;

/**
 * These tags contain endpoints that could either send or return
 * farm specific data and/or farm neutral default data.
 *
 * For data safety if the sent data or returned data
 * should not be used between farms add it here.
 *
 * Using this may be an indicator of possible improvements to backend architecture
 *
 * Does not belong here:
 * eg. 'MarketDirectoryPartners' sends farm.country and returns country specific library data
 * even though farm.country is farm related it is generic/anonymous enough to be reused between farms
 * eg. 'DefaultAnimalBreeds' sends nothing and returns library data
 *
 *  Belongs here:
 * eg. 'DefaultAnimalTypes' sends '?count=true' and returns farm specific data
 * even though 'DefaultAnimalTypes' sends nothing and returns library data
 */
export const FarmLibraryTags = [
  // 'count' param returns farm specific data
  'DefaultAnimalTypes',
] as const;

export const API_TAGS = [...LibraryTags, ...FarmTags, ...FarmLibraryTags] as const;

export type ApiTag = (typeof API_TAGS)[number];
export type FarmTag = (typeof FarmTags)[number];
export type FarmLibraryTag = (typeof FarmLibraryTags)[number];
