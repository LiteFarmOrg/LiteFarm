import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import PureFilterPage from '../../../components/FilterPage';
import Input from '../../../components/Form/Input';
import { useDispatch, useSelector } from 'react-redux';
import {
  TYPE,
  CLEANING_PRODUCT,
  CROP_COMPLIANCE,
  FERTILIZING_PRODUCT,
  PEST_CONTROL_PRODUCT,
  SOIL_AMENDMENT,
  SOIL_SAMPLE_RESULTS,
  WATER_SAMPLE_RESULTS,
  OTHER,
  VALID_ON,
  UNCATEGORIZED,
} from '../constants';
import { documentsFilterSelector, setDocumentsFilter } from '../../filterSlice';

const types = [
  CLEANING_PRODUCT,
  CROP_COMPLIANCE,
  FERTILIZING_PRODUCT,
  PEST_CONTROL_PRODUCT,
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
  const [validUntilDate, setValidUntilDate] = useState(documentsFilter[VALID_ON] ?? '');

  const handleApply = () => {
    const filterToApply = {
      ...filterRef.current,
      VALID_ON: validUntilDate ? validUntilDate : undefined,
    };
    dispatch(setDocumentsFilter(filterToApply));
    onGoBack?.();
  };
  const handleDateChange = (e) => {
    setValidUntilDate(e.target.value);
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
      resetters={[
        {
          setFunc: setValidUntilDate,
          defaultVal: '',
        },
      ]}
    >
      <Input
        label={t('DOCUMENTS.FILTER.VALID_ON')}
        type={'date'}
        value={validUntilDate}
        onChange={handleDateChange}
      />
    </PureFilterPage>
  );
};

DocumentsFilterPage.prototype = {
  subject: PropTypes.string,
  items: PropTypes.array,
};

export default DocumentsFilterPage;
