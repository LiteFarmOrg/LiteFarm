import React from 'react';
import PureAddNewCrop from '../../components/AddNewCrop';
import { HookFormPersistProvider } from '../hooks/useHookFormPersist/HookFormPersistProvider';
import { useSelector } from 'react-redux';
import { hookFormPersistEntryPathSelector } from '../hooks/useHookFormPersist/hookFormPersistSlice';

function AddNewCrop({ history }) {
  const entryPath = useSelector(hookFormPersistEntryPathSelector);
  const onError = (error) => {
    console.log(error);
  };

  return (
    <HookFormPersistProvider>
      <PureAddNewCrop
        handleContinue={() => history.push(`/crop/new/add_crop_variety`)}
        handleGoBack={() => history.push(entryPath)}
        handleCancel={() => history.push(entryPath)}
        handleError={onError}
      />
    </HookFormPersistProvider>
  );
}

export default AddNewCrop;
