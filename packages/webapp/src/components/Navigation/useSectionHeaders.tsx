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

import { ANIMALS_INVENTORY_URL, ADD_ANIMALS_URL } from '../../util/siteMapConstants';
import { useTranslation, Trans } from 'react-i18next';
import type { Pathname } from 'history';
import Badge from '../Badge';
import React from 'react';
import styles from './styles.module.scss';

// Key value pair for path and its header
interface PathHeaderKVP {
  [key: string]: string | React.ReactElement;
}

/**
 * Retrieves the translated section header based on the provided path.
 *
 * @param {Pathname} path - The pathname to match against specific sections.
 * @returns {string | React.ReactElement | null} Returns the translated section header if the path matches a known section, otherwise returns null.
 *
 * @example
 * const currentPath = '/animals';
 * const sectionHeader = useSectionHeader(currentPath);
 * console.log(sectionHeader); // Output: 'Translated Animals Section Header'
 */

export function useSectionHeader(path: Pathname): string | React.ReactElement | null {
  const { t } = useTranslation(['translation']);

  const animalInventoryTitle = (
    <div className={styles.animalInventoryTitle}>
      <div className={styles.text}>{t('SECTION_HEADER.ANIMALS_INVENTORY')}</div>
      <Badge
        title={t('BADGE.BETA.TITLE')}
        content={
          <Trans i18nKey={'BADGE.BETA.ANIMALS_CONTENT'} components={{ a: <a href="#" /> }} />
        }
        id="animalsBeta"
        classes={{ iconButton: styles.badge }}
      />
    </div>
  );

  const HEADERS_BY_PATH: PathHeaderKVP = {
    [ANIMALS_INVENTORY_URL]: animalInventoryTitle,
    [ADD_ANIMALS_URL]: t('SECTION_HEADER.ANIMALS_INVENTORY'),
  };

  return HEADERS_BY_PATH[path] ?? null;
}
