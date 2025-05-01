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
export const TAGS = {
  // Weather tags
  WEATHER: {
    WEATHER: 'Weather',
  },
} as const;

/**
   * TODO: Organize the following tags into logical groups 
   * and move them into the TAGS object. Example structure:
   * ANIMALS: {
        ANIMALS: 'Animals',
        BATCHES: 'Batches',
        CUSTOM_BREADS: 'CustomBreeds',
        DEFAULT_BREADS: 'DefaultBreeds'
    }
   */
const baseTags: string[] = [
  'Animals',
  'AnimalBatches',
  'CustomAnimalBreeds',
  'CustomAnimalTypes',
  'DefaultAnimalBreeds',
  'DefaultAnimalTypes',
  'AnimalSexes',
  'AnimalIdentifierTypes',
  'AnimalIdentifierColors',
  'AnimalMovementPurposes',
  'AnimalOrigins',
  'AnimalUses',
  'AnimalRemovalReasons',
  'SoilAmendmentMethods',
  'SoilAmendmentPurposes',
  'SoilAmendmentFertiliserTypes',
  'SoilAmendmentProduct',
  'Sensors',
  'SensorReadings',
  'FarmAddon',
];

// Helper to get all tag values for API initialization
export const getAllTags = (): string[] => {
  const tags = Object.values(TAGS).flatMap((tagGroup) => Object.values(tagGroup)) as string[];

  return [...baseTags, ...tags];
};
