import React from 'react';
import PureInGroundTransplant from '../../../../components/Crop/InGroundTransplant';
import { HookFormPersistProvider } from '../../../hooks/useHookFormPersist/HookFormPersistProvider';

function InGroundTransplant({ history, match }) {

  const onContinue = () => {

  };

  const onCancel = () => {
  }

  const onGoBack = () => {
  }

  return (
    <HookFormPersistProvider>
      <PureInGroundTransplant
        onContinue={onContinue}
        onCancel={onCancel}
        onGoBack={onGoBack}
      />
    </HookFormPersistProvider>
  );
}

export default InGroundTransplant;