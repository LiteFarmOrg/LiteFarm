import React from 'react';
import PureWaterValve from '../../../components/PointDetailsLayout/WaterValve';
import { postWaterValveLocation } from './saga';
import { useDispatch } from 'react-redux';
import { waterValveEnum } from '../../waterValveSlice';
import { useTranslation } from 'react-i18next';

function WaterValveDetailForm({ history }) {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const submitForm = (data) => {
    const message = `${t('FARM_MAP.MAP_FILTER.WV')}${t('message:MAP.SUCCESS_POST')}`;
    dispatch(postWaterValveLocation({ form: data, message: message }));
  };

  return <PureWaterValve history={history} submitForm={submitForm} pointType={waterValveEnum} />;
}

export default WaterValveDetailForm;
