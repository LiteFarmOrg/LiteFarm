import React from 'react';
import Button from '../../Form/Button';
import Form from '../../Form';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import MultiStepPageTitle from '../../PageTitle/MultiStepPageTitle';
import { Label, Main } from '../../Typography';
import styles from './styles.module.scss';
import Input from '../../Form/Input';
import RadioGroup from '../../Form/RadioGroup';
import { waterUsage } from '../../../util/unit';
import Unit from '../../Form/Unit';
import AddProduct from '../AddProduct';

const PureCleaningTask = ({ onSubmit, onError, handleGoBack, handleCancel, system, products }) => {
  const { t } = useTranslation();
  const { handleSubmit, register, control, setValue, getValues, watch } = useForm();

  const CLEANING_TARGET = 'cleaning_target';
  const AGENT_USED = 'agent_used';
  const WATER_USAGE = 'water_usage';
  const WATER_USAGE_UNIT = 'water_usage_unit';

  const isCleaningAgentUsed = watch(AGENT_USED);

  return (
    <Form
      buttonGroup={
        <div style={{ display: 'flex', flexDirection: 'column', rowGap: '16px', flexGrow: 1 }}>
          <Button color={'primary'} fullLength>
            {t('common:SAVE')}
          </Button>
        </div>
      }
      onSubmit={handleSubmit(onSubmit, onError)}
    >
      <MultiStepPageTitle
        style={{ marginBottom: '24px' }}
        onGoBack={handleGoBack}
        onCancel={handleCancel}
        title={t('ADD_TASK.ADD_A_TASK')}
        cancelModalTitle={t('ADD_TASK.CANCEL')}
        value={86}
      />
      <Main className={styles.mb24}>{t('ADD_TASK.CLEANING.TITLE')}</Main>
      <Input
        label={t('ADD_TASK.CLEANING.WHAT_NEEDS_TO_BE')}
        name={CLEANING_TARGET}
        style={styles.mb24}
        hookFormRegister={register(CLEANING_TARGET)}/>

      <Main>{t('ADD_TASK.CLEANING.WILL_CLEANER_BE_USED')}</Main>
      <RadioGroup
        style={styles.mb24}
        hookFormControl={control}
        name={AGENT_USED}
        required
      />

      {isCleaningAgentUsed && (
        <AddProduct
          system={system}
          watch={watch}
          type={'cleaning'}
          register={register}
          getValues={getValues}
          setValue={setValue}
          control={control}
          products={products}
        />
      )}
      <Unit
        register={register}
        label={t('ADD_TASK.CLEANING.ESTIMATED_WATER')}
        name={WATER_USAGE}
        displayUnitName={WATER_USAGE_UNIT}
        unitType={waterUsage}
        system={system}
        hookFormSetValue={setValue}
        hookFormGetValue={getValues}
        hookFromWatch={watch}
        control={control}
        required
      />

    </Form>

  )
}


export default PureCleaningTask;