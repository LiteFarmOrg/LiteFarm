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
export const LIBRARY_TAGS = {
  ANIMAL_SEXES: 'AnimalSexes',
  ANIMAL_IDENTIFIER_TYPES: 'AnimalIdentifierTypes',
  ANIMAL_IDENTIFIER_COLORS: 'AnimalIdentifierColors',
  ANIMAL_MOVEMENT_PURPOSES: 'AnimalMovementPurposes',
  ANIMAL_ORIGINS: 'AnimalOrigins',
  ANUMAL_USES: 'AnimalUses',
  ANIMAL_REMOVAL_REASONS: 'AnimalRemovalReasons',
  DEFAULT_ANIMAL_BREEDS: 'DefaultAnimalBreeds',
  SOIL_AMENDMENT_METHODS: 'SoilAmendmentMethods',
  SOIL_AMENDMENT_PURPOSES: 'SoilAmendmentPurposes',
  SOIL_AMENDMENT_FERTILIZER_TYPES: 'SoilAmendmentFertiliserTypes',
} as const;

/**
 * These tags contain endpoints that return farm specific data
 *
 * These data should not persist when switching farms,
 * or should be stored in a separate farm store.
 */
export const FARM_TAGS = {
  ANIMALS: 'Animals',
  ANIMAL_BATCHES: 'AnimalBatches',
  CUSTOM_ANIMAL_BATCHES: 'CustomAnimalBreeds',
  CUSTOM_ANIMAL_TYPES: 'CustomAnimalTypes',
  FARM_ADDON: 'FarmAddon',
  IRRIGATION_PRESCRIPTION: 'IrrigationPrescriptions',
  IRRIGATION_PRESCRIPTION_DETAILS: 'IrrigationPrescriptionDetails',
  SOIL_AMENDMENT_PRODUCT: 'SoilAmendmentProduct',
  SENSORS: 'Sensors',
  SENSOR_READING: 'SensorReadings',
  WEATHER: 'Weather',
} as const;

/**
 * These tags contain endpoints that could either return farm specific data
 * or farm neutral defaults data.
 *
 * For data safety these data should also not persist when switching farms,
 * or should be stored in a separate farm store.
 */
export const FARM_LIBRARY_TAGS = {
  // 'count' param returns farm specific data
  DEFAULT_ANIMAL_TYPES: 'DefaultAnimalTypes',
} as const;

// helper to preserve literal tuple
function tuple<T extends readonly string[]>(...args: T) {
  return args;
}

const TAG_GROUPS = { LIBRARY_TAGS, FARM_TAGS, FARM_LIBRARY_TAGS } as const;

export const API_TAGS = tuple(
  ...Object.values(TAG_GROUPS).flatMap((group) => Object.values(group)),
);

export type ApiTag = (typeof API_TAGS)[number];
