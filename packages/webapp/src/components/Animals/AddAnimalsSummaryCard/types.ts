/*
 *  Copyright 2024 LiteFarm.org
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

import { AnimalTypeIconKey } from '../../Icons/icons';

export interface AnimalSexCountSummary {
  [key: string]: number | undefined;
}

export interface AnimalSummary {
  type: string; // Translated, to display in the card
  breed?: string;
  sexDetails: AnimalSexCountSummary;
  iconKey: AnimalTypeIconKey;
  count: number;
}

export interface BatchSummary {
  type: string;
  breed?: string;
  count: number;
  sexDetails?: never;
  iconKey?: never;
}
