import React from 'react';
import PureGate from '../../../components/PointDetailsLayout/Gate';
import { postGateLocation } from './saga';
import { useDispatch } from 'react-redux';
import { gateEnum } from '../../gateSlice';
import { useTranslation } from 'react-i18next';

function GateDetailForm({ history }) {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const submitForm = (data) => {
    const message = `${t('FARM_MAP.MAP_FILTER.GATE')}${t('message:MAP.SUCCESS_POST')}`;
    dispatch(postGateLocation({ form: data, message: message }));
  };

  return <PureGate history={history} submitForm={submitForm} pointType={gateEnum} />;
}

export default GateDetailForm;
