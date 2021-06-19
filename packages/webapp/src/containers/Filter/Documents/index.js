import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import PureFilterPage from '../../../components/FilterPage';
import { useDispatch, useSelector } from 'react-redux';
import {
  TYPE,
  CLEANING_PRODUCT,
  CROP_COMPLIANCE,
  FERTILIZING_PRODUCT,
  PEST_CONTROL_PRODUCT,
  SOIL_AMENDMENTS,
  OTHER,
} from '../constants';
import {
  cropCatalogueFilterSelector,
  documentsFilterSelector,
  setCropCatalogueFilter,
} from '../../filterSlice';

const types = [
  CLEANING_PRODUCT,
  CROP_COMPLIANCE,
  FERTILIZING_PRODUCT,
  PEST_CONTROL_PRODUCT,
  SOIL_AMENDMENTS,
  OTHER,
];

const DocumentsFilterPage = ({ onGoBack }) => {
  const { t } = useTranslation(['translation', 'filter']);
  const documentsFilter = useSelector(documentsFilterSelector);
  const dispatch = useDispatch();

  const handleApply = () => {
    // dispatch(setCropCatalogueFilter(filterRef.current));
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
