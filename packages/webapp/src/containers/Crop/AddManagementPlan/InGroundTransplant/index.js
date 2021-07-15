import React from 'react';
import PureInGroundTransplant from '../../../../components/Crop/InGroundTransplant';
import { HookFormPersistProvider } from '../../../hooks/useHookFormPersist/HookFormPersistProvider';

function InGroundTransplant({ history, match }) {

  return (
    <HookFormPersistProvider>
      <PureInGroundTransplant
       history={history}
       match={match}
      />
    </HookFormPersistProvider>
  );
}

export default InGroundTransplant;