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
import { revenueTypesSelector } from '../../../revenueTypeSlice';

export default function useSortedRevenueTypes() {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const [sortedtypes, setSortedTypes] = useState([]);
  const revenueTypes = useSelector(revenueTypesSelector);

  useEffect(() => {
    dispatch(getRevenueTypes());
  }, []);

  useEffect(() => {
    const defaultTypes = [];
    const customTypes = [];
    revenueTypes?.forEach((type) => {
      const arrayToUpdate = type.farm_id ? customTypes : defaultTypes;
      arrayToUpdate.push(type);
    });

    const allTypes = [
      ...defaultTypes.sort((typeA, typeB) =>
        t(`revenue:${typeA.revenue_translation_key}`).localeCompare(
          t(`revenue:${typeB.revenue_translation_key}`),
        ),
      ),
      ...customTypes.sort((typeA, typeB) =>
        typeA.revenue_translation_key.localeCompare(typeB.revenue_translation_key),
      ),
    ];

    setSortedTypes(allTypes);
  }, [revenueTypes]);

  return sortedtypes;
}

useSortedRevenueTypes.propTypes = {
  useHookFormPersist: PropTypes.func,
  history: PropTypes.object,
};
