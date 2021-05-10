import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import PureFilterPage from '../../../components/FilterPage';
import { cropLocationsSelector } from '../../locationSlice';
import { useSelector, useDispatch } from 'react-redux';
import {
  STATUS,
  ACTIVE,
  ABANDONED,
  PLANNED,
  COMPLETE,
  NEEDS_PLAN,
  LOCATION,
  SUPPLIERS,
} from './constants';
import { cropCatalogFilterSelector, setCropCatalogFilter } from '../../filterSlice';

const statuses = [ACTIVE, ABANDONED, PLANNED, COMPLETE, NEEDS_PLAN];

const CropCatalogFilterPage = () => {
  const { t } = useTranslation();
  const cropEnabledLocations = useSelector(cropLocationsSelector);
  const cropCatalogFilter = useSelector(cropCatalogFilterSelector);
  const dispatch = useDispatch();

  const handleApply = () => {
    dispatch(setCropCatalogFilter(filterRef.current));
  };
  const filterRef = useRef({});

  const filters = [
    {
      subject: t('CROP_CATALOG.FILTER.STATUS.SUBJECT'),
      filterKey: STATUS,
      options: statuses.map((status) => ({
        value: status,
        default: cropCatalogFilter[STATUS][status] ?? false,
        label: t(`CROP_CATALOG.FILTER.STATUS.${status}`),
      })),
    },
    {
      subject: t('CROP_CATALOG.FILTER.LOCATION'),
      filterKey: LOCATION,
      options: cropEnabledLocations.map((location) => ({
        value: location.location_id,
        default: cropCatalogFilter[LOCATION][location.location_id] ?? false,
        label: location.name,
      })),
    },
    {
      subject: t('CROP_CATALOG.FILTER.SUPPLIERS'),
      filterKey: SUPPLIERS,
      options: [],
    },
  ];

  return (
    <PureFilterPage
      title={t('CROP_CATALOG.FILTER.TITLE')}
      filters={filters}
      onApply={handleApply}
      filterRef={filterRef}
    />
  );
};

CropCatalogFilterPage.prototype = {
  subject: PropTypes.string,
  items: PropTypes.array,
};

export default CropCatalogFilterPage;
