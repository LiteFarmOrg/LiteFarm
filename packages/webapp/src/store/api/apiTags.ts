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
export const WEATHER_TAGS = {
  WEATHER: 'Weather',
} as const;

/**
   * TODO: Organize the following tags into logical groups 
   * Example structure:
   * ANIMALS_TAGS: {
        ANIMALS: 'Animals',
        BATCHES: 'Batches',
        CUSTOM_BREADS: 'CustomBreeds',
        DEFAULT_BREADS: 'DefaultBreeds'
    }
   */

// helper to preserve literal tuple
function tuple<T extends readonly string[]>(...args: T) {
  return args;
}

const TAG_GROUPS = { WEATHER_TAGS } as const;

export const API_TAGS = tuple(
  ...Object.values(TAG_GROUPS).flatMap((group) => Object.values(group)),
);

export type ApiTag = (typeof API_TAGS)[number];
