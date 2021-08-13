import ReactSelect from '../../Form/ReactSelect';
import React, { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import Input from '../../Form/Input';
import RadioGroup from '../../Form/RadioGroup';
import { waterUsage } from '../../../util/unit';
import Unit from '../../Form/Unit';


const AddProduct = ({ products, type, system, getValues, setValue, watch, control, register }) => {
  const { t } = useTranslation();
  const typesOfProduct = {
    cleaning: {
      units: waterUsage
    }
  }
  const NAME = 'name';
  const SUPPLIER = 'supplier';
  const PERMITTED  = 'on_permitted_substances_list';
  const PRODUCT_QUANTITY = 'product_quantity';
  const PRODUCT_QUANTITY_UNIT = 'product_quantity_unit';

  return (
    <>
      <Controller
        control={control}
        name={NAME}
        rules={{ required: true }}
        render={({ field: { onChange, onBlur, value } }) => (
          <ReactSelect
            label={t('ADD_PRODUCT.PRODUCT_LABEL')}
            options={products}
            onChange={(e) => {
              onChange(e);
            }}
            value={value}
            style={{ marginBottom: '40px' }}
          />
        )}
      />
      <Input name={SUPPLIER} label={t('ADD_PRODUCT.SUPPLIER_LABEL')} hookFormRegister={register(SUPPLIER)} />
      <RadioGroup hookFormControl={control} name={PERMITTED} showNotSure />
      <Unit
        register={register}
        label={t('ADD_TASK.CLEANING.ESTIMATED_WATER')}
        name={PRODUCT_QUANTITY}
        displayUnitName={PRODUCT_QUANTITY_UNIT}
        unitType={typesOfProduct[type].units}
        system={system}
        hookFormSetValue={setValue}
        hookFormGetValue={getValues}
        hookFromWatch={watch}
        control={control}
        required
      />
    </>
  )
}


export default AddProduct;
