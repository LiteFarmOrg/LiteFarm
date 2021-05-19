import React from 'react';
import PureAddNewCrop from '../../components/AddNewCrop';
import useHookFormPersist from '../hooks/useHookFormPersist';

import { useForm } from 'react-hook-form';

function AddNewCrop({ history }) {
  const methods = useForm({
    mode: 'onChange',
  });
  const {
    setValue,
    getValues,
    formState: { errors },
  } = methods;

  const persistedPath = ['/crop/new/add_crop_variety', '/crop/new/add_crop_variety/compliance'];
  const { persistedData } = useHookFormPersist(persistedPath, getValues, setValue);

  const onError = (error) => {
    console.log(error);
  };

  return (
    <PureAddNewCrop
      handleContinue={() => history.push(`/crop/new/add_crop_variety`)}
      handleGoBack={() => history.push(`/crop_catalogue`)}
      handleCancel={() => history.push(`/crop_catalogue`)}
      handleError={onError}
      hookFormMethods={methods}
    />
  );
}

export default AddNewCrop;
