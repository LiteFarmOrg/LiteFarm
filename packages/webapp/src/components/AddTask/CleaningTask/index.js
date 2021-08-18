import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Label, Main } from '../../Typography';
import styles from './styles.module.scss';
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
  watch,
  farm,
  disabled = false
}) => {
  const { t } = useTranslation();
  const CLEANING_TARGET = 'cleaning_task.cleaning_target';
  const AGENT_USED = 'cleaning_task.agent_used';
  const WATER_USAGE = 'cleaning_task.water_usage';
  const WATER_USAGE_UNIT = 'cleaning_task.water_usage_unit';
  const filtered = products.filter(({ type }) => type === 'cleaning_task');
  const isCleaningAgentUsed = watch(AGENT_USED);
  return (
    <>
      <Input
        label={t('ADD_TASK.CLEANING_VIEW.WHAT_NEEDS_TO_BE')}
        name={CLEANING_TARGET}
        disabled={disabled}
        style={{ marginBottom: '40px', marginTop: '24px'}}
        hookFormRegister={register(CLEANING_TARGET)}
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
        required
        disabled={disabled}
      />
    </>
  );
};

export default PureCleaningTask;
