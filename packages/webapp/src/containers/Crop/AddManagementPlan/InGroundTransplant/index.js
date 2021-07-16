import React from 'react';
import PureInGroundTransplant from '../../../../components/Crop/InGroundTransplant';
import { HookFormPersistProvider } from '../../../hooks/useHookFormPersist/HookFormPersistProvider';

function InGroundTransplant({ history, match }) {

  const variety_id = match?.params?.variety_id;

  return (
    <HookFormPersistProvider>
      <PureInGroundTransplant
       history={history}
       variety_id={variety_id}
      />
    </HookFormPersistProvider>
  );
}

export default InGroundTransplant;
