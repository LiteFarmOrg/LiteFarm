import ReactSelect from '../../Form/ReactSelect';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import Input from '../../Form/Input';
import RadioGroup from '../../Form/RadioGroup';
import { waterUsage } from '../../../util/unit';
import Unit from '../../Form/Unit';
import { Main } from '../../Typography';

const AddProduct = ({
  products,
  type,
  system,
  getValues,
  setValue,
  watch,
  control,
  register,
  farm,
  disabled,
}) => {
  const { t } = useTranslation();
  const [productValue, setProductValue] = useState(null);
  const typesOfProduct = {
    cleaning_task: {
      units: waterUsage,
      label: t('ADD_TASK.CLEANING_VIEW.IS_PERMITTED'),
    },
  };
  const NAME = `${type}.product.name`;
  const FARM = `${type}.product.farm_id`;
  const SUPPLIER = `${type}.product.supplier`;
  const TYPE = `${type}.product.type`;
  const PERMITTED = `${type}.product.on_permitted_substances_list`;
  const PRODUCT_QUANTITY = `${type}.product_quantity`;
  const PRODUCT_QUANTITY_UNIT = `${type}.product_quantity_unit`;
  const PRODUCT_ID = `${type}.product_id`;

  const processProduct = (value) => {
    let product = products.find(({ product_id }) => product_id === value?.value);
    if (product) {
      const { supplier, on_permitted_substances_list } = product;
      setValue(NAME, value?.label);
      setValue(PRODUCT_ID, value?.value);
      setValue(SUPPLIER, supplier);
      setValue(PERMITTED, on_permitted_substances_list);
    } else {
      setValue(NAME, value.label);
      setValue(PRODUCT_ID, null);
      setValue(SUPPLIER, null);
      setValue(PERMITTED, null);
    }
  };

  const transformProductsToLabel = (products) =>
    products.map(({ product_id, name }) => ({ label: name, value: product_id }));

  useEffect(() => {
    setValue(FARM, farm);
    setValue(TYPE, type);
    const [id, name] = getValues([PRODUCT_ID, NAME]);
    if (id && name) {
      setProductValue({ label: name, value: id });
    } else if (!id && name) {
      setProductValue({ label: name, value: name });
    }
  }, []);

  return (
    <>
      <ReactSelect
        label={t('ADD_PRODUCT.PRODUCT_LABEL')}
        options={transformProductsToLabel(products)}
        onChange={(e) => {
          processProduct(e);
          setProductValue(e);
        }}
        value={productValue}
        style={{ marginBottom: '40px' }}
        creatable
        isDisabled={disabled}
      />
      <input name={NAME} style={{ display: 'none' }} {...register(NAME, { required: true })} />
      <input name={PRODUCT_ID} style={{ display: 'none' }} {...register(PRODUCT_ID)} />
      <Input
        name={SUPPLIER}
        label={t('ADD_PRODUCT.SUPPLIER_LABEL')}
        hookFormRegister={register(SUPPLIER)}
        style={{ marginBottom: '40px' }}
        disabled={disabled}
      />
      <Main style={{ marginBottom: '18px' }}>{typesOfProduct[type].label}</Main>
      <RadioGroup hookFormControl={control} name={PERMITTED} disabled={disabled} showNotSure />
      <Unit
        style={{ marginBottom: '40px', marginTop: '34px' }}
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
        disabled={disabled}
        required
      />
    </>
  );
};

export default AddProduct;
