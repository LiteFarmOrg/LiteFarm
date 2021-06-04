import React from 'react';
import PureAddNewCrop from '../../components/AddNewCrop';
import useHookFormPersist from '../hooks/useHookFormPersist';
import { useSelector } from 'react-redux';
import { hookFormPersistSelector } from '../hooks/useHookFormPersist/hookFormPersistSlice';

function AddNewCrop({ history }) {
  const defaultValues = useSelector(hookFormPersistSelector);

  const onError = (error) => {
    console.log(error);
  };

  return (
    <PureAddNewCrop
      handleContinue={() => history.push(`/crop/new/add_crop_variety`)}
      handleGoBack={() => history.push(`/crop_catalogue`)}
      handleCancel={() => history.push(`/crop_catalogue`)}
      handleError={onError}
      useHookFormPersist={useHookFormPersist}
      defaultValues={defaultValues}
    />
  );
}

export default AddNewCrop;
