import React from 'react';
import PureFarmSiteBoundary from '../../../components/AreaDetailsLayout/FarmSiteBoundary';
import { postFarmSiteLocation } from './saga';
import { useDispatch, useSelector } from 'react-redux';
import { farmSiteBoundaryEnum } from '../../farmSiteBoundarySlice';
import { useTranslation } from 'react-i18next';
import { measurementSelector } from '../../userFarmSlice';
import { locationInfoSelector } from '../../mapSlice';

function FarmSiteBoundaryDetailForm({ history }) {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const system = useSelector(measurementSelector);
  const { grid_points } = useSelector(locationInfoSelector);
  
  const submitForm = (data) => {
    const message = `${t('FARM_MAP.MAP_FILTER.FSB')}${t('message:MAP.SUCCESS_POST')}`;
    dispatch(postFarmSiteLocation({ form: data, message: message }));
  };
  return (
    <PureFarmSiteBoundary
      history={history}
      submitForm={submitForm}
      system={system}
      grid_points={grid_points}
      areaType={farmSiteBoundaryEnum}
    />
  );
}

export default FarmSiteBoundaryDetailForm;
