import React from 'react';
import PureAddNewCrop from '../../components/AddNewCrop';
import { HookFormPersistProvider } from '../hooks/useHookFormPersist/HookFormPersistProvider';

function AddNewCrop({ history }) {
  const onError = (error) => {
    console.log(error);
  };

  return (
    <HookFormPersistProvider>
      <PureAddNewCrop
        handleContinue={() => history.push(`/crop/new/add_crop_variety`)}
        handleGoBack={() => history.goBack()}
        handleError={onError}
      />
    </HookFormPersistProvider>
  );
}

export default AddNewCrop;
