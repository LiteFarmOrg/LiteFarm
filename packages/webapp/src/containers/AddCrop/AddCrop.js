import React, { useEffect, useState } from 'react';
import PureAddCrop from '../../components/AddCrop';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { cropSelector } from '../cropSlice';
import { useForm } from 'react-hook-form';
import { saveNewVarietal } from '../cropVarietySlice';
import { postVarietal } from './saga';
import useHookFormPersist from '../hooks/useHookFormPersist';
import { certifierSurveySelector } from '../OrganicCertifierSurvey/slice';

function AddCropForm({ history, match }) {
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors, isValid },
  } = useForm({
    mode: 'onChange',
    shouldUnregister: true,
  });

  const VARIETY = 'crop_variety_name';
  const SUPPLIER = 'supplier';
  const SEED_TYPE = 'seed_type';
  const LIFE_CYCLE = 'lifecycle';

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

  const persistedPath = [`/crop/${crop_id}/add_crop_variety/compliance`];

  const { interested } = useSelector(certifierSurveySelector, shallowEqual);

  const {
    persistedData: { variety, supplier, seed_type, lifecycle },
  } = useHookFormPersist(persistedPath, getValues, setValue, false);

  const onError = (error) => {
    console.log(error);
  };

  const onContinue = (data) => {
    history.push(`/crop/${crop_id}/add_crop_variety/compliance`);
    dispatch(saveNewVarietal(data));
  };

  const onSubmit = (data) => {
    let newVarietal = {};
    newVarietal.crop_id = Number(crop_id);
    newVarietal.crop_variety_name = data.crop_variety_name;
    newVarietal.supplier = data.supplier;
    newVarietal.seed_type = data.seed_type;
    newVarietal.lifecycle = data.lifecycle;
    newVarietal.compliance_file_url = '';
    newVarietal.organic = null;
    newVarietal.treated = null;
    newVarietal.genetically_engineered = null;
    newVarietal.searched = null;
    dispatch(postVarietal(newVarietal));
    history.push(`/crop_catalogue`);
  };

  return (
    <>
      <PureAddCrop
        history={history}
        disabled={disabled}
        onContinue={
          interested ? handleSubmit(onContinue, onError) : handleSubmit(onSubmit, onError)
        }
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
