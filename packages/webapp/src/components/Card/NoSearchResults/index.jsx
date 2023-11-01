/*
 *  Copyright 2023 LiteFarm.org
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

import React from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';
import { Semibold, Text } from '../../Typography';
import { useTranslation, Trans } from 'react-i18next';
import clsx from 'clsx';

export const NoSearchResults = ({
  searchTerm,
  includeFiltersInClearSuggestion,
  className,
  style,
}) => {
  const { t } = useTranslation();

  return (
    <div className={clsx(styles.container, className)} style={style}>
      <Semibold>{t('SEARCH.ZERO')}</Semibold>
      <Text className={styles.noResultsForText}>
        <Trans i18nKey="SEARCH.NO_RESULTS_FOR" shouldUnescape>
          Sorry, we couldn&apos;t find any results for your search term
          <b>&apos;{{ searchTerm }}&apos;</b>
        </Trans>
      </Text>
      {includeFiltersInClearSuggestion ? (
        <Text>{t('SEARCH.CLEAR_TERMS_AND_FILTERS')}</Text>
      ) : (
        <Text>{t('SEARCH.CLEAR_TERMS')}</Text>
      )}
    </div>
  );
};

NoSearchResults.propTypes = {
  searchTerm: PropTypes.string,
  includeFiltersInClearSuggestion: PropTypes.bool,
  className: PropTypes.string,
  style: PropTypes.object,
};

NoSearchResults.defaultProps = {
  searchTerm: '',
  includeFiltersInClearSuggestion: false,
  className: '',
};

export default NoSearchResults;
