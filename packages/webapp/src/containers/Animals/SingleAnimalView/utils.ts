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

import { getLocalDateInYYYYDDMM } from '../../../util/date';

export const generateFormDate = (date?: string | null) => {
  return date ? getLocalDateInYYYYDDMM(new Date(date)) : '';
  // Right now the new date validation logic will fail if null is maintained; may want to revisit/change that but for now an empty string will pass (and matches 'add' mode)
};
