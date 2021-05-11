import React, { useEffect, useState } from 'react';
import PureAddCrop from '../../components/AddCrop';
import { useDispatch, useSelector } from 'react-redux';
import { cropsSelector } from '../../containers/cropSlice';
import { userFarmSelector } from '../../containers/userFarmSlice';
import useHookFormPersist from '../hooks/useHookFormPersist';
import { useForm } from 'react-hook-form';

function AddCropForm({ history, match }) {
  const dispatch = useDispatch();
  

  const {location_id} = match.params;

  const { 
    register, 
    handleSubmit, 
    setValue,
    watch,
    formState: { isValid, isDirty, errors}, 
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
  }

  const variety = watch(VARIETY, undefined);
  const supplier = watch(SUPPLIER, undefined);
  const seedType = watch(SEED_TYPE, undefined);
  const lifeCycle = watch(LIFE_CYCLE, undefined);

  const disabled = !variety || !supplier || !seedType || !lifeCycle;

  const varietyRegister = register(VARIETY, {required: true });
  const supplierRegister = register(SUPPLIER, {required: true });
  const seedTypeRegister = register(SEED_TYPE, {required: true });
  const lifeCycleRegister = register(LIFE_CYCLE, {required: true });
  

  useEffect(() => {
    // TODO
  });

  const onError = (data) => {};
  
  const onSubmit = (data) => {
    // TODO
  };



  return (
    <>
     <PureAddCrop
        history={history}
        locationID = {location_id}
        disabled = {disabled}
        onSubmit = {handleSubmit(onSubmit)}
        cropEnum = {cropEnum}
        useHookFormPersist = {useHookFormPersist}
        varietyRegister = {varietyRegister}
        supplierRegister = {supplierRegister}
        seedTypeRegister = {seedTypeRegister}
        lifeCycleRegister = {lifeCycleRegister}
     />
    </>
  );
}

export default AddCropForm;