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

import { ANIMALS_URL } from '../../util/siteMapConstants';
import { matchPath } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { Pathname } from 'history';

/**
 * Retrieves the translated section header based on the provided path.
 *
 * @param {Pathname} path - The pathname to match against specific sections.
 * @returns {string | null} Returns the translated section header if the path matches a known section, otherwise returns null.
 *
 * @example
 * const currentPath = '/animals';
 * const sectionHeader = useSectionHeader(currentPath);
 * console.log(sectionHeader); // Output: 'Translated Animals Section Header'
 */

export function useSectionHeader(path: Pathname): string | null {
  const { t } = useTranslation(['translation']);
  const animalsSection = matchPath(path, ANIMALS_URL);
  if (animalsSection) {
    return t('MENU.ANIMALS');
  }
  return null;
}
