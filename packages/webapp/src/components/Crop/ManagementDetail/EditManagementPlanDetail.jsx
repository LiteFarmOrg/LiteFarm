import React from 'react';
import CropHeader from '../CropHeader';
import { useTranslation } from 'react-i18next';
import Button from '../../Form/Button';
import { Info, Label } from '../../Typography';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';
import { useForm } from 'react-hook-form';
import { seedYield } from '../../../util/convert-units/unit';
import Unit from '../../Form/Unit';
import InputAutoSize from '../../Form/InputAutoSize';
import Input, { getInputErrors } from '../../Form/Input';
import Form from '../../Form';

export default function PureEditManagementDetail({ onBack, variety, plan, system, onSubmit }) {
  const { t } = useTranslation();

  const title = plan?.name;

  const {
    register,
    handleSubmit,
    getValues,
    watch,
    control,
    setValue,
    formState: { errors, isValid },
  } = useForm({
    defaultValues: {
      notes: plan.notes,
      name: plan.name,
      crop_management_plan: {
        estimated_yield: plan.estimated_yield,
        estimated_yield_unit: plan.estimated_yield_unit,
      },
    },
    shouldUnregister: false,
    mode: 'onChange',
  });
  const ESTIMATED_YIELD = `crop_management_plan.estimated_yield`;
  const ESTIMATED_YIELD_UNIT = `crop_management_plan.estimated_yield_unit`;
  const NOTES = 'notes';
  const NAME = 'name';

  return (
    <Form
      onSubmit={handleSubmit(onSubmit)}
      buttonGroup={
        <>
          {
            <Button disabled={!isValid} fullLength type={'submit'}>
              {t('common:UPDATE')}
            </Button>
          }
        </>
      }
    >
      <CropHeader onBackClick={onBack} variety={variety} />

      <div className={styles.titlewrapper}>
        <Label className={styles.title} style={{ marginTop: '24px', marginBottom: '28px' }}>
          {t('common:EDIT')} {title}{' '}
        </Label>
      </div>

      <Input
        style={{ marginBottom: '40px' }}
        label={t('MANAGEMENT_PLAN.PLAN_NAME')}
        hookFormRegister={register(NAME, { required: true })}
        errors={getInputErrors(errors, NAME)}
      />

      <InputAutoSize
        style={{ marginBottom: '40px' }}
        label={t('MANAGEMENT_PLAN.PLAN_NOTES')}
        hookFormRegister={register(NOTES, {
          maxLength: { value: 10000, message: t('MANAGEMENT_PLAN.NOTES_CHAR_LIMIT') },
        })}
        optional
        errors={errors[NOTES]?.message}
      />

      <Unit
        register={register}
        label={t('MANAGEMENT_PLAN.ESTIMATED_YIELD')}
        name={ESTIMATED_YIELD}
        displayUnitName={ESTIMATED_YIELD_UNIT}
        unitType={seedYield}
        system={system}
        hookFormSetValue={setValue}
        hookFormGetValue={getValues}
        hookFromWatch={watch}
        control={control}
        required={true}
        style={{ marginBottom: '40px' }}
      />

      <Info className={styles.bottomText} style={{ marginBottom: '16px' }}>
        {t('MANAGEMENT_PLAN.EDITING_PLAN_WILL_NOT_MODIFY')}
      </Info>
    </Form>
  );
}

PureEditManagementDetail.prototype = {
  onBack: PropTypes.func,
  variety: PropTypes.object,
  plan: PropTypes.object,
  system: PropTypes.oneOf(['imperial', 'metric']).isRequired,
  onSubmit: PropTypes.func,
};
