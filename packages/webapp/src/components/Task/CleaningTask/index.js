import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Main } from '../../Typography';
import Input from '../../Form/Input';
import RadioGroup from '../../Form/RadioGroup';
import { waterUsage } from '../../../util/unit';
import Unit from '../../Form/Unit';
import AddProduct from '../AddProduct';

const PureCleaningTask = ({
  system,
  products,
  register,
  control,
  setValue,
  getValues,
  formState,
  watch,
  farm,
  disabled = false,
}) => {
  const { t } = useTranslation();
  const CLEANING_TARGET = 'cleaning_task.cleaning_target';
  const AGENT_USED = 'cleaning_task.agent_used';
  const WATER_USAGE = 'cleaning_task.water_usage';
  const WATER_USAGE_UNIT = 'cleaning_task.water_usage_unit';
  const filtered = products.filter(({ type }) => type === 'cleaning_task');
  const isCleaningAgentUsed = watch(AGENT_USED);

  useEffect(() => {
    if (isCleaningAgentUsed === false && getValues('cleaning_task.product')) {
      setValue('cleaning_task.product', null);
      setValue('cleaning_task.product_id', null);
      setValue('cleaning_task.product_quantity', undefined);
      setValue('cleaning_task.product_quantity_unit', null, { shouldValidate: true });
    }
  }, [isCleaningAgentUsed]);
  return (
    <>
      <Input
        label={t('ADD_TASK.CLEANING_VIEW.WHAT_NEEDS_TO_BE')}
        name={CLEANING_TARGET}
        disabled={disabled}
        style={{ marginBottom: '40px', marginTop: '24px' }}
        hookFormRegister={register(CLEANING_TARGET)}
        optional
      />

      <Main>{t('ADD_TASK.CLEANING_VIEW.WILL_CLEANER_BE_USED')}</Main>
      <RadioGroup
        style={{ marginBottom: '24px', marginTop: '18px' }}
        hookFormControl={control}
        name={AGENT_USED}
        disabled={disabled}
        required
      />

      {isCleaningAgentUsed && (
        <AddProduct
          system={system}
          watch={watch}
          type={'cleaning_task'}
          register={register}
          getValues={getValues}
          setValue={setValue}
          control={control}
          formState={formState}
          products={filtered}
          farm={farm}
          disabled={disabled}
        />
      )}
      <Unit
        register={register}
        style={{ marginBottom: '40px' }}
        label={t('ADD_TASK.CLEANING_VIEW.ESTIMATED_WATER')}
        name={WATER_USAGE}
        displayUnitName={WATER_USAGE_UNIT}
        unitType={waterUsage}
        system={system}
        hookFormSetValue={setValue}
        hookFormGetValue={getValues}
        hookFromWatch={watch}
        control={control}
        optional
        disabled={disabled}
      />
    </>
  );
};

export default PureCleaningTask;
