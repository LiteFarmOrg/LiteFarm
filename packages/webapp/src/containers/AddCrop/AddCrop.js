import React, { useEffect, useState } from 'react';
import PureAddCrop from '../../components/AddCrop';
import { useDispatch, useSelector } from 'react-redux';
import { cropSelector } from '../cropSlice';
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

  const crop_id = match.params.crop_id;
  const crop = useSelector(cropSelector(crop_id));
  const imageKey = crop.crop_translation_key.toLowerCase();
  

  useEffect(() => {
  }, []);

  const onError = (data) => {};

  const onContinue = (data) => {
    // TODO - Crop Variety
    console.log(data);
    history.push(`/crop/${crop_id}/add_crop_variety/compliance`);
  };



  return (
    <>
      <PureAddCrop
        history={history}
        disabled={disabled}
        onContinue={handleSubmit(onContinue)}
        cropEnum={cropEnum}
        imageKey={imageKey}
        cropName={crop.crop_common_name}
        varietyRegister={varietyRegister}
        supplierRegister={supplierRegister}
        seedTypeRegister={seedTypeRegister}
        lifeCycleRegister={lifeCycleRegister}
      />
    </>
  );
}

export default AddCropForm;
