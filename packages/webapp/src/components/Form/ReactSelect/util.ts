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

import { BasicEnum } from '../../../store/api/types';
import i18n from '../../../locales/i18n';

export type ReactSelectOptionForEnum = {
  value: number;
  label: string;
  key: string;
};

export const mapReactSelectOptionsForEnum = (
  enumArray: BasicEnum[],
  translationPrefix: string,
): ReactSelectOptionForEnum[] => {
  return enumArray.map((en) => ({
    value: en.id,
    label: i18n.t(`${translationPrefix}.${en.key}`),
    key: en.key,
  }));
};
