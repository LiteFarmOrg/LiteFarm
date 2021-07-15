import React from 'react';
import { useSelector } from 'react-redux';
import { HookFormPersistProvider } from '../../../hooks/useHookFormPersist/HookFormPersistProvider';
import PureNextHarvest from '../../../../components/Crop/NextHarvest';
import { measurementSelector } from '../../../userFarmSlice';

function NextHarvest({ history, match }) {
  const variety_id = match.params.variety_id;
  const system = useSelector(measurementSelector);

  const onCancel = () => {
    history.push(`/crop/${variety_id}/management`);
  }
  const onGoBack = () => {
    history.push(`/crop/${variety_id}/add_management_plan/needs_transplant`);
  }

  const onContinue = () => {
    history.push(`/crop/${variety_id}/add_management_plan/choose_planting_location`);
  }

  return (
    <HookFormPersistProvider>
      <PureNextHarvest
        onContinue={onContinue}
        onGoBack={onGoBack}
        onCancel={onCancel}
        system={system}
        variety={variety_id}
      />
    </HookFormPersistProvider>
  );
}

export default NextHarvest;