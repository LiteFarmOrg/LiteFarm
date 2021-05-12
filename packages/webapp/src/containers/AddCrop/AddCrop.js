import React, { useEffect, useState } from 'react';
import PureAddCrop from '../../components/AddCrop';
import { useDispatch, useSelector } from 'react-redux';
import { userFarmSelector } from '../../containers/userFarmSlice';
import { useForm } from 'react-hook-form';

function AddCropForm({ history, match }) {
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isValid },
  } = useForm({
    mode: 'onChange',
    shouldUnregister: true,
  });

  const VARIETY = 'variety';
  const SUPPLIER = 'supplier';
  const SEED_TYPE = 'seed_type';
  const LIFE_CYCLE = 'life_cycle';

  const cropEnum = {
    variety: VARIETY,
    supplier: SUPPLIER,
    seed_type: SEED_TYPE,
    life_cycle: LIFE_CYCLE,
  };

  const disabled = !isValid;

  const varietyRegister = register(VARIETY, { required: true });
  const supplierRegister = register(SUPPLIER, { required: true });
  const seedTypeRegister = register(SEED_TYPE, { required: true });
  const lifeCycleRegister = register(LIFE_CYCLE, { required: true });

  useEffect(() => {
    // TODO - Crop Variety
  }, []);

  const onError = (data) => {};

  const onContinue = (data) => {
    // TODO - Crop Variety
    console.log(data);
    history.push('/crop_add/compliance');
  };

  return (
    <>
      <PureAddCrop
        history={history}
        disabled={disabled}
        onContinue={handleSubmit(onContinue)}
        cropEnum={cropEnum}
        varietyRegister={varietyRegister}
        supplierRegister={supplierRegister}
        seedTypeRegister={seedTypeRegister}
        lifeCycleRegister={lifeCycleRegister}
      />
    </>
  );
}

export default AddCropForm;
