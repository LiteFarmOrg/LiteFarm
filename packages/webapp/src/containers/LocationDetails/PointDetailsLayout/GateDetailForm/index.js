import React from 'react';
import PureGate from '../../../../components/LocationDetailLayout/PointDetailsLayout/Gate';
import { postGateLocation } from './saga';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import useHookFormPersist from '../../../hooks/useHookFormPersist';
import { useLocationPageType } from '../../utils';

function GateDetailForm({ history, match }) {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const submitForm = (data) => {
    dispatch(postGateLocation(data));
  };

  return (
    <PureGate
      history={history}
      match={match}
      submitForm={submitForm}
      useHookFormPersist={useHookFormPersist}
    />
  );
}

export default GateDetailForm;
