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

import {
  ANIMALS_INVENTORY_URL,
  ADD_ANIMALS_URL,
  MAP_ROUTES,
  PRODUCT_INVENTORY_URL,
} from '../../util/siteMapConstants';
import { useTranslation, Trans } from 'react-i18next';
import type { Pathname } from 'history';
import Badge from '../Badge';
import React from 'react';
import styles from './styles.module.scss';
import { BETA_BADGE_LINK } from '../../util/constants';

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

  const betaTitle = (title: string, spotlightKey: string) => (
    <div className={styles.betaSectionHeaderTitle}>
      <div className={styles.text}>{title}</div>
      <Badge
        title={t('BADGE.BETA.TITLE')}
        content={
          <Trans
            i18nKey={`BADGE.BETA.${spotlightKey.toUpperCase()}_CONTENT`}
            components={{ a: <a href={BETA_BADGE_LINK} target="_blank" rel="noreferrer" /> }}
          />
        }
        id={spotlightKey}
        classes={{ iconButton: styles.badge }}
      />
    </div>
  );

  const generalTitle = (title: string) => <div className={styles.generalTitle}>{title}</div>;

  const HEADERS_BY_PATH: PathHeaderKVP = {
    [ANIMALS_INVENTORY_URL]: betaTitle(t('SECTION_HEADER.ANIMALS_INVENTORY'), 'animals_beta'),
    [ADD_ANIMALS_URL]: betaTitle(t('ADD_ANIMAL.ADD_ANIMALS_TITLE'), 'animals_beta'),
    [PRODUCT_INVENTORY_URL]: betaTitle(t('MENU.INVENTORY'), 'inventory_beta'),
  };

  // Add routes for all location types
  for (const route of MAP_ROUTES) {
    HEADERS_BY_PATH[route] = generalTitle(t('MENU.MAP'));
  }

  const exact = HEADERS_BY_PATH[path];
  if (exact) return exact;

  // Also handle dynamic routes
  const fallbackKey = Object.keys(HEADERS_BY_PATH).find((key) => path.startsWith(`${key}/`));

  return fallbackKey ? HEADERS_BY_PATH[fallbackKey] : null;
}
