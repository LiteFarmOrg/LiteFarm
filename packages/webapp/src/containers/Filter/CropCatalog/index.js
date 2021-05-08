import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import PureFilterPage from '../../../components/FilterPage';
import { cropLocationsSelector } from '../../locationSlice';
import { useSelector } from 'react-redux';
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

const statuses = [ACTIVE, ABANDONED, PLANNED, COMPLETE, NEEDS_PLAN];

const CropCatalogFilterPage = () => {
  const { t } = useTranslation();
  const cropEnabledLocations = useSelector(cropLocationsSelector);

  const handleApply = () => {
    console.log('purefilterpage: ', filterRef.current);
  };
  const filterRef = useRef({});

  // TODO: read filter reducer saved values
  const cropCatalogFilter = {
    STATUS: {
      ACTIVE: true,
      ABANDONED: false,
      PLANNED: true,
      COMPLETE: false,
      NEEDS_PLAN: false,
    },
    LOCATION: {
      '4a3a3eb2-acf0-11eb-82a2-acde48001122': true,
    },
  };

  const filters = [
    {
      subject: t('CROP_CATALOG.FILTER.STATUS.SUBJECT'),
      filterKey: STATUS,
      options: statuses.map((status) => ({
        value: status,
        default: cropCatalogFilter[STATUS][status],
        label: t(`CROP_CATALOG.FILTER.STATUS.${status}`),
      })),
    },
    {
      subject: t('CROP_CATALOG.FILTER.LOCATION'),
      filterKey: LOCATION,
      options: cropEnabledLocations.map((location) => ({
        value: location.location_id,
        default: cropCatalogFilter[LOCATION][location.location_id],
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
