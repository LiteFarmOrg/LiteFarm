import ReactSelect from '../../Form/ReactSelect';
import React, { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import Input from '../../Form/Input';
import RadioGroup from '../../Form/RadioGroup';
import { waterUsage } from '../../../util/unit';
import Unit from '../../Form/Unit';
import { Main } from '../../Typography';


const AddProduct = ({ products, type, system, getValues, setValue, watch, control, register, farm }) => {
  const { t } = useTranslation();
  const typesOfProduct = {
    cleaning_task: {
      units: waterUsage,
      label: t('ADD_TASK.CLEANING_VIEW.IS_PERMITTED')
    }
  }
  const NAME = `${type}.product.name`;
  const FARM = `${type}.product.farm_id`;
  const SUPPLIER = `${type}.product.supplier`;
  const TYPE = `${type}.product.type`;
  const PERMITTED  = `${type}.product.on_permitted_substances_list`;
  const PRODUCT_QUANTITY = `${type}.product_quantity`;
  const PRODUCT_QUANTITY_UNIT = `${type}.product_quantity_unit`;
  const PRODUCT_ID = `${type}.product_id`;

  const processProduct = (value) => {
    let product = products.find(({ product_id }) => product_id === value?.label);
    if(product) {
      const { supplier, on_permitted_substances_list } = product;
      setValue(SUPPLIER, supplier);
      setValue(PERMITTED, on_permitted_substances_list);
      setValue(PRODUCT_ID, value?.label)
    } else {
      setValue(PRODUCT_ID, null);
      setValue(SUPPLIER, null);
      setValue(PERMITTED, null);
    }
  }

  const transformProductsToLabel = products=> products.map(({product_id, name}) => ({ label: name, value: { label: product_id, value: name } }));

  useEffect(() => {
    setValue(FARM, farm);
    setValue(TYPE, type);
  }, [])

  return (
    <>
      <Controller
        control={control}
        name={NAME}
        rules={{ required: true }}
        render={({ field: { onChange, onBlur, value } }) => (
          <ReactSelect
            label={t('ADD_PRODUCT.PRODUCT_LABEL')}
            options={transformProductsToLabel(products)}
            onChange={(e) => {
              processProduct(e.value);
              onChange(e);
            }}
            value={value}
            style={{ marginBottom: '40px' }}
            creatable
          />
        )}
      />
      <Input
        name={SUPPLIER}
        label={t('ADD_PRODUCT.SUPPLIER_LABEL')}
        hookFormRegister={register(SUPPLIER)}
        style={{ marginBottom: '40px' }}
      />
      <Main style={{ marginBottom: '18px' }}>{ typesOfProduct[type].label }</Main>
      <RadioGroup hookFormControl={control} name={PERMITTED} showNotSure />
      <Unit
        style={{marginBottom: '40px', marginTop:'34px'}}
        register={register}
        label={t('ADD_PRODUCT.QUANTITY')}
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
