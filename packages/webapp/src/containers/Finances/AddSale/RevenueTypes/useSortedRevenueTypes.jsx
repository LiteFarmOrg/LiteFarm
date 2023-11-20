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
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { getRevenueTypes } from '../../saga';
import { revenueTypesSelector, allRevenueTypesSelector } from '../../../revenueTypeSlice';

export default function useSortedRevenueTypes({ selectorType = 'default' } = {}) {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const [sortedtypes, setSortedTypes] = useState([]);

  const selector = selectorType === 'all' ? allRevenueTypesSelector : revenueTypesSelector;
  const revenueTypes = useSelector(selector);

  useEffect(() => {
    dispatch(getRevenueTypes());
  }, []);

  useEffect(() => {
    const allTypes = revenueTypes ?? [];

    const sortedTypes = [
      ...allTypes.sort((typeA, typeB) => {
        const compareKeyA =
          typeA.farm_id === null
            ? t(`revenue:${typeA.revenue_translation_key}.REVENUE_NAME`)
            : typeA.revenue_translation_key;

        const compareKeyB =
          typeB.farm_id === null
            ? t(`revenue:${typeB.revenue_translation_key}.REVENUE_NAME`)
            : typeB.revenue_translation_key;

        return compareKeyA.localeCompare(compareKeyB);
      }),
    ];

    setSortedTypes(sortedTypes);
  }, [revenueTypes]);

  return sortedtypes;
}

useSortedRevenueTypes.propTypes = {
  props: PropTypes.shape({
    selectorType: PropTypes.string,
  }),
  useHookFormPersist: PropTypes.func,
  history: PropTypes.object,
};
