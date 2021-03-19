import React from 'react';
import PureFarmSiteBoundary from '../../../components/AreaDetailsLayout/FarmSiteBoundary';
import { postFarmSiteLocation } from './saga';
import { useDispatch } from 'react-redux';
import { farmSiteBoundaryEnum } from '../../farmSiteBoundarySlice';
import { useTranslation } from 'react-i18next';

function FarmSiteBoundaryDetailForm({ history }) {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const submitForm = (data) => {
    const message = `${t('FARM_MAP.MAP_FILTER.FSB')}${t('message:MAP.SUCCESS_POST')}`;
    dispatch(postFarmSiteLocation({ form: data, message: message }));
  };
  return (
    <PureFarmSiteBoundary
      history={history}
      submitForm={submitForm}
      areaType={farmSiteBoundaryEnum}
    />
  );
}

export default FarmSiteBoundaryDetailForm;
