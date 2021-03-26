import React from 'react';
import PureGate from '../../../components/PointDetailsLayout/Gate';
import { postGateLocation } from './saga';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import useHookFormPersist from '../../hooks/useHookFormPersist';

function GateDetailForm({ history }) {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const submitForm = (data) => {
    dispatch(postGateLocation(data));
  };

  return (
    <PureGate history={history} submitForm={submitForm} useHookFormPersist={useHookFormPersist} />
  );
}

export default GateDetailForm;
