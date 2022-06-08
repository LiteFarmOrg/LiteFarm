import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import PureFilterPage from '../../../components/FilterPage';
import { cropLocationsSelector } from '../../locationSlice';
import { useDispatch, useSelector } from 'react-redux';
import {
  ABANDONED,
  ACTIVE,
  COMPLETE,
  LOCATION,
  NEEDS_PLAN,
  PLANNED,
  STATUS,
  SUPPLIERS,
} from '../constants';
import {
  cropVarietyFilterSelector,
  setCropVarietyFilter,
  setCropVarietyFilterDefault,
} from '../../filterSlice';
import { suppliersByCropIdSelector } from '../../cropVarietySlice';
import { SEARCHABLE_MULTI_SELECT } from '../../../components/Filter/filterTypes';

const statuses = [ACTIVE, ABANDONED, PLANNED, COMPLETE, NEEDS_PLAN];

const CropVarietyFilterPage = ({ cropId, onGoBack }) => {
  const { t } = useTranslation(['translation', 'filter']);
  const cropEnabledLocations = useSelector(cropLocationsSelector);
  const cropVarietyFilter = useSelector(cropVarietyFilterSelector(cropId));
  const suppliers = useSelector(suppliersByCropIdSelector(cropId));
  const dispatch = useDispatch();

  useEffect(() => {
    if (!cropVarietyFilter) {
      dispatch(setCropVarietyFilterDefault(cropId));
    }
  }, []);

  const handleApply = () => {
    dispatch(
      setCropVarietyFilter({
        cropId,
        cropVarietyFilter: filterRef.current,
      }),
    );
    onGoBack?.();
  };
  const filterRef = useRef({});

  const filters = [
    {
      subject: t('CROP_CATALOGUE.FILTER.STATUS'),
      filterKey: STATUS,
      options: statuses.map((status) => ({
        value: status,
        default: cropVarietyFilter?.[STATUS][status]?.active ?? false,
        label: t(`filter:CROP_CATALOGUE.${status}`),
      })),
    },
    {
      subject: t('CROP_CATALOGUE.FILTER.LOCATION'),
      filterKey: LOCATION,
      type: SEARCHABLE_MULTI_SELECT,
      options: cropEnabledLocations.map((location) => ({
        value: location.location_id,
        default: cropVarietyFilter?.[LOCATION][location.location_id]?.active ?? false,
        label: location.name,
      })),
    },
    {
      subject: t('CROP_CATALOGUE.FILTER.SUPPLIERS'),
      filterKey: SUPPLIERS,
      type: SEARCHABLE_MULTI_SELECT,
      options: suppliers.map((supplier) => ({
        value: supplier,
        default: cropVarietyFilter?.[SUPPLIERS][supplier]?.active ?? false,
        label: supplier,
      })),
    },
  ];

  return (
    <PureFilterPage
      title={t('CROP_CATALOGUE.FILTER.TITLE')}
      filters={filters}
      onApply={handleApply}
      filterRef={filterRef}
      onGoBack={onGoBack}
    />
  );
};

CropVarietyFilterPage.prototype = {
  crop_id: PropTypes.number,
};

export default CropVarietyFilterPage;
