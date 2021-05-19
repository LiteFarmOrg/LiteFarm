import React, { useRef } from 'react';
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
} from './constants';
import { cropCatalogueFilterSelector, setCropCatalogueFilter } from '../../filterSlice';
import { suppliersSelector } from '../../cropVarietySlice';

const statuses = [ACTIVE, ABANDONED, PLANNED, COMPLETE, NEEDS_PLAN];

const CropCatalogueFilterPage = ({ onGoBack }) => {
  const { t } = useTranslation(['translation', 'filter']);
  const cropEnabledLocations = useSelector(cropLocationsSelector);
  const cropCatalogueFilter = useSelector(cropCatalogueFilterSelector);
  const suppliers = useSelector(suppliersSelector);
  const dispatch = useDispatch();

  const handleApply = () => {
    dispatch(setCropCatalogueFilter(filterRef.current));
    onGoBack?.();
  };
  const filterRef = useRef({});

  const filters = [
    {
      subject: t('CROP_CATALOGUE.FILTER.STATUS'),
      filterKey: STATUS,
      options: statuses.map((status) => ({
        value: status,
        default: cropCatalogueFilter[STATUS][status] ?? false,
        label: t(`filter:CROP_CATALOGUE.${status}`),
      })),
    },
    {
      subject: t('CROP_CATALOGUE.FILTER.LOCATION'),
      filterKey: LOCATION,
      options: cropEnabledLocations.map((location) => ({
        value: location.location_id,
        default: cropCatalogueFilter[LOCATION][location.location_id] ?? false,
        label: location.name,
      })),
    },
    {
      subject: t('CROP_CATALOGUE.FILTER.SUPPLIERS'),
      filterKey: SUPPLIERS,
      options: suppliers.map((supplier) => ({
        value: supplier,
        default: cropCatalogueFilter[SUPPLIERS][supplier] ?? false,
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

CropCatalogueFilterPage.prototype = {
  subject: PropTypes.string,
  items: PropTypes.array,
};

export default CropCatalogueFilterPage;
