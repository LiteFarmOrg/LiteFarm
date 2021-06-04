import React from 'react';
import PureBroadcastPlan from '../../components/BroadcastPlan';
import { useSelector } from 'react-redux';
import { hookFormPersistSelector } from '../hooks/useHookFormPersist/hookFormPersistSlice';
import { measurementSelector } from '../userFarmSlice';

function BroadcastPlan({ history }) {
  const persistedFormData = useSelector(hookFormPersistSelector);
  const system = useSelector(measurementSelector)

  const onCancel = () => {
    history.push('/')
  }

  const onContinue = () => {

  }

  const onBack = () => {

  }

  return (
    <PureBroadcastPlan
      onCancel={onCancel}
      handleContinue={onContinue}
      onGoBack={onBack}
      system={system}
      persistedForm={persistedFormData}
    />
  )
}