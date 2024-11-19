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

import { RouteComponentProps } from 'react-router-dom';
import { History } from 'history';

export enum OrganicStatus {
  'NON_ORGANIC' = 'Non-Organic',
  'TRANSITIONAL' = 'Transitional',
  'ORGANIC' = 'Organic',
}

// Custom RouteComponentProps with a custom history type from the 'history' library
export type CustomRouteComponentProps<T extends { [K in keyof T]?: string | undefined }> = Omit<
  RouteComponentProps<T>,
  'history'
> & {
  history: History; // Custom history type
};
