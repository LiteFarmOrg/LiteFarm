import React, { useRef } from 'react';
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
import { DATE } from '../../../components/Filter/filterTypes';

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

  const handleApply = () => {
    dispatch(setDocumentsFilter(filterRef.current));
    onGoBack?.();
  };

  const filterRef = useRef({});

  const filters = [
    {
      subject: t('DOCUMENTS.FILTER.TYPE'),
      filterKey: TYPE,
      options: types.map((type) => ({
        value: type,
        default: documentsFilter[TYPE][type]?.active ?? false,
        label: t(`filter:DOCUMENTS.${type}`),
      })),
    },
    {
      subject: t('DOCUMENTS.FILTER.VALID_ON'),
      filterKey: 'VALID_ON',
      type: DATE,
      defaultValue: documentsFilter[VALID_ON],
    },
  ];

  return (
    <PureFilterPage
      title={t('DOCUMENTS.FILTER.TITLE')}
      filters={filters}
      onApply={handleApply}
      filterRef={filterRef}
      onGoBack={onGoBack}
    />
  );
};

DocumentsFilterPage.prototype = {
  subject: PropTypes.string,
  items: PropTypes.array,
};

export default DocumentsFilterPage;
