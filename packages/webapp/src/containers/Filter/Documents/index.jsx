/*
 *  Copyright (c) 2024 LiteFarm.org
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

import { useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import PureFilterPage from '../../../components/FilterPage';
import { useDispatch, useSelector } from 'react-redux';
import {
  CLEANING_PRODUCT,
  CROP_COMPLIANCE,
  FERTILIZING_PRODUCT,
  OTHER,
  PEST_CONTROL_PRODUCT,
  SOIL_AMENDMENT,
  SOIL_SAMPLE_RESULTS,
  TYPE,
  UNCATEGORIZED,
  VALID_ON,
  WATER_SAMPLE_RESULTS,
  RECEIPTS,
  INVOICES,
} from '../constants';
import { documentsFilterSelector, setDocumentsFilter } from '../../filterSlice';
import { FilterType } from '../../../components/Filter/types';

const types = [
  CLEANING_PRODUCT,
  CROP_COMPLIANCE,
  FERTILIZING_PRODUCT,
  INVOICES,
  PEST_CONTROL_PRODUCT,
  RECEIPTS,
  SOIL_AMENDMENT,
  SOIL_SAMPLE_RESULTS,
  WATER_SAMPLE_RESULTS,
  OTHER,
  UNCATEGORIZED,
];

const DocumentsFilterPage = ({ onGoBack }) => {
  const { t } = useTranslation(['translation', 'filter']);
  const documentsFilter = useSelector(documentsFilterSelector);
  const dispatch = useDispatch();

  const [tempFilter, setTempFilter] = useState({});

  const handleApply = () => {
    dispatch(setDocumentsFilter(tempFilter));
    onGoBack?.();
  };

  const filters = [
    {
      subject: t('DOCUMENTS.FILTER.TYPE'),
      filterKey: TYPE,
      type: FilterType.SEARCHABLE_MULTI_SELECT,
      options: types.map((type) => ({
        value: type,
        default: documentsFilter[TYPE][type]?.active ?? false,
        label: t(`filter:DOCUMENTS.${type}`),
      })),
    },
    {
      subject: t('DOCUMENTS.FILTER.VALID_ON'),
      filterKey: 'VALID_ON',
      type: FilterType.DATE,
      defaultValue: documentsFilter[VALID_ON],
    },
  ];

  return (
    <PureFilterPage
      filters={filters}
      onApply={handleApply}
      tempFilter={tempFilter}
      setTempFilter={setTempFilter}
      onGoBack={onGoBack}
    />
  );
};

DocumentsFilterPage.prototype = {
  subject: PropTypes.string,
  items: PropTypes.array,
};

export default DocumentsFilterPage;
