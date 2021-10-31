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
        handleGoBack={() => history.push(`/crop_catalogue`)}
        handleCancel={() => history.push(`/crop_catalogue`)}
        handleError={onError}
      />
    </HookFormPersistProvider>
  );
}

export default AddNewCrop;
