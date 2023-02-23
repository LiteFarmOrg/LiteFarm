import ReactSelect from '../../Form/ReactSelect';
import React, { useEffect, useMemo, useState } from 'react';
import { ReactComponent as Leaf } from '../../../assets/images/farmMapFilter/Leaf.svg';
import { useTranslation } from 'react-i18next';
import Input, { getInputErrors } from '../../Form/Input';
import RadioGroup from '../../Form/RadioGroup';
import { pest, soilAmounts, waterUsage } from '../../../util/convert-units/unit';
import Unit from '../../Form/Unit';
import { Main } from '../../Typography';
import { CANADA } from './constants';

const AddProduct = ({
  products,
  type,
  system,
  getValues,
  setValue,
  watch,
  control,
  register,
  formState: { errors },
  farm,
  disabled,
}) => {
  const { t } = useTranslation();
  const { farm_id, interested, country_id } = farm;

  const productsOfType = useMemo(
    () => products.filter((product) => product.type === type),
    [products.length, type],
  );

  const [productValue, setProductValue] = useState(null);
  const typesOfProduct = {
    cleaning_task: {
      units: waterUsage,
      label: t('ADD_TASK.CLEANING_VIEW.IS_PERMITTED'),
    },
    soil_amendment_task: {
      units: soilAmounts,
      label: t('ADD_TASK.SOIL_AMENDMENT_VIEW.IS_PERMITTED'),
    },
    pest_control_task: {
      label: t('ADD_TASK.PEST_CONTROL_VIEW.IS_PERMITTED'),
      units: pest,
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
    setValue(`${type}.product.product_id`, undefined);
    let product = productsOfType.find(({ product_id }) => product_id === value?.value);
    if (product) {
      const { supplier, on_permitted_substances_list } = product;
      setValue(NAME, value?.label, { shouldValidate: true });
      setValue(PRODUCT_ID, value?.value);
      setValue(SUPPLIER, supplier);
      setValue(PERMITTED, on_permitted_substances_list, { shouldValidate: true });
    } else {
      setValue(NAME, value?.label, { shouldValidate: true });
      setValue(PRODUCT_ID, null);
      setValue(SUPPLIER, null);
      setValue(PERMITTED, null);
    }
  };
  const isInterestedInCanada = useMemo(
    () => interested && country_id === CANADA,
    [country_id, interested],
  );
  const transformProductsToLabel = (products) =>
    products.map(({ product_id, name }) => ({ label: name, value: product_id }));

  useEffect(() => {
    setValue(FARM, farm_id);
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
        options={transformProductsToLabel(productsOfType)}
        onChange={(e) => {
          processProduct(e);
          setProductValue(e);
        }}
        placeholder={t('ADD_PRODUCT.PRESS_ENTER')}
        value={productValue}
        style={{ marginBottom: '40px' }}
        creatable
        hasLeaf={true}
        isDisabled={disabled}
      />
      <input name={NAME} style={{ display: 'none' }} {...register(NAME, { required: true })} />
      <input name={PRODUCT_ID} style={{ display: 'none' }} {...register(PRODUCT_ID)} />
      <Input
        data-cy={'addTask-supplier'}
        name={SUPPLIER}
        label={t('ADD_PRODUCT.SUPPLIER_LABEL')}
        hookFormRegister={register(SUPPLIER, { required: interested })}
        style={{ marginBottom: '40px' }}
        disabled={disabled}
        hasLeaf={true}
        errors={getInputErrors(errors, SUPPLIER)}
      />
      {isInterestedInCanada && (
        <>
          <Main style={{ marginBottom: '18px' }}>
            {typesOfProduct[type].label} <Leaf style={{ display: 'inline-block' }} />
          </Main>
          <RadioGroup
            hookFormControl={control}
            name={PERMITTED}
            required={true}
            disabled={disabled}
            showNotSure
          />
          <div style={{ marginBottom: '34px' }} />
        </>
      )}
      <Unit
        label={t('ADD_PRODUCT.QUANTITY')}
        data-cy="soilAmendment-quantity"
        hasLeaf
        style={{ marginBottom: '40px' }}
        register={register}
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
