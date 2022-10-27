import React, { FC, useState } from 'react';
import { AddLink, Label, Main, Underlined } from '../../Typography';
import { useTranslation } from 'react-i18next';
import Button from '../../Form/Button';
import Form from '../../Form';
import { Controller, useForm } from 'react-hook-form';
import MultiStepPageTitle from '../../PageTitle/MultiStepPageTitle';
import ReactSelect from '../../Form/ReactSelect';
import Checkbox from '../../Form/Checkbox';
import RadioGroup from '../../Form/RadioGroup';
import styles from '../../Crop/styles.module.scss';
import Input, { integerOnKeyDown } from '../../Form/Input';

export interface IPureIrrigationTask {
  onContinue: () => void;
  onGoBack: () => void;
}

const PureIrrigationTask: FC<IPureIrrigationTask> = ({ onContinue, onGoBack, ...props }) => {
  const [checked, setChecked] = useState<boolean>();
  const onCheckBoxClick = () => setChecked(!checked);
  // @ts-ignore
  const { persistedFormData, useHookFormPersist } = props;

  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    getValues,
    watch,
    control,
    formState: { isValid, errors },
  } = useForm({
    mode: 'onChange',
    shouldUnregister: false,
    defaultValues: { ...persistedFormData },
  });
  const disabled = !isValid;
  const { historyCancel } = useHookFormPersist(getValues);
  const LIFECYCLE = 'lifecycle';
  const IrrigationTypeOptions = [
    { label: t('ADD_TASK.IRRIGATION_VIEW.TYPE.HAND_WATERING'), value: 'HAND_WATERING' },
    { label: t('ADD_TASK.IRRIGATION_VIEW.TYPE.CHANNEL'), value: 'CHANNEL' },
    { label: t('ADD_TASK.IRRIGATION_VIEW.TYPE.DRIP'), value: 'DRIP' },
    { label: t('ADD_TASK.IRRIGATION_VIEW.TYPE.FLOOD'), value: 'FLOOD' },
    { label: t('ADD_TASK.IRRIGATION_VIEW.TYPE.PIVOT'), value: 'PIVOT' },
    { label: t('ADD_TASK.IRRIGATION_VIEW.TYPE.SPRINKLER'), value: 'SPRINKLER' },
    { label: t('ADD_TASK.IRRIGATION_VIEW.TYPE.SUB_SURFACE'), value: 'SUB_SURFACE' },
    { label: t('ADD_TASK.IRRIGATION_VIEW.TYPE.OTHER'), value: 'OTHER' },
  ];

  return (
    <Form
      buttonGroup={
        <Button type={'submit'} disabled={disabled} fullLength>
          {t('common:CONTINUE')}
        </Button>
      }
    >
      <MultiStepPageTitle
        style={{ marginBottom: '24px' }}
        onGoBack={onGoBack}
        onCancel={historyCancel}
        title={t('ADD_TASK.ADD_A_TASK')}
        cancelModalTitle={t('ADD_TASK.CANCEL')}
      />
      <Main style={{ marginBottom: '16px' }}>
        {t('ADD_TASK.IRRIGATION_VIEW.TELL_US_ABOUT_YOUR_IRRIGATION_TASK')}
      </Main>

      <Controller
        control={control}
        name={t('IRRIGATION_TASK_LOWER')}
        rules={{ required: true }}
        render={({ field: { onChange, value } }) => (
          <ReactSelect
            label={t('ADD_TASK.IRRIGATION_VIEW.TYPE_OF_IRRIGATION')}
            options={IrrigationTypeOptions}
            style={{ marginBottom: '10px' }}
            onChange={(e) => {
              onChange(e);
            }}
            value={
              !value
                ? value
                : value?.value
                ? value
                : { value, label: t(`ADD_TASK.IRRIGATION_VIEW.TYPE.${value}`) }
            }
          />
        )}
      />

      <Checkbox
        label={t('ADD_TASK.IRRIGATION_VIEW.SET_AS_DEFAULT_TYPE_FOR_THIS_LOCATION')}
        onClick={onCheckBoxClick}
        checked={checked}
        sm
        style={{ marginTop: '2px', marginBottom: '20px' }}
      />
      <Label className={styles.label} style={{ marginBottom: '12px', marginTop: '10px' }}>
        {t('ADD_TASK.IRRIGATION_VIEW.HOW_DO_YOU_MEASURE_WATER_USE_FOR_THIS_IRRIGATION_TYPE')}
      </Label>

      <RadioGroup
        hookFormControl={control}
        name={LIFECYCLE}
        // style={{ paddingBottom: '5px' }}
        radios={[
          { value: 'VOLUME', label: t('ADD_TASK.IRRIGATION_VIEW.VOLUME') },
          {
            value: 'DEPTH',
            label: t('ADD_TASK.IRRIGATION_VIEW.DEPTH'),
          },
        ]}
      />
      <Checkbox
        label={t('ADD_TASK.IRRIGATION_VIEW.SET_AS_DEFAULT_MEASUREMENT_FOR_THIS_IRRIGATION_TYPE')}
        onClick={onCheckBoxClick}
        checked={checked}
        sm
        style={{ marginTop: '2px', marginBottom: '20px' }}
      />

      <Input
        label={t('ADD_TASK.IRRIGATION_VIEW.ESTIMATED_WATER_USAGE')}
        // style={{ paddingBottom: '16px', paddingTop: '24px' }}
        hookFormRegister={register('estimated_water_usage', { valueAsNumber: true })}
        type={'number'}
        onKeyDown={integerOnKeyDown}
        max={9999999999}
        optional
      />
      {/*<Underlined onClick={forgotPassword}>Calculate Water Usage</Underlined>*/}
      <Underlined>Calculate Water Usage</Underlined>
    </Form>
  );
};
export default PureIrrigationTask;
