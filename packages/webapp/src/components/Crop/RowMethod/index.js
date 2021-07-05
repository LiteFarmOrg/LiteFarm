import React, { useEffect, useState } from 'react';
import styles from './styles.module.scss';
import { useTranslation } from 'react-i18next';
import { Label, Main } from '../../Typography';
import Input, { integerOnKeyDown } from '../../Form/Input';
import InputAutoSize from '../../Form/InputAutoSize';
import Form from '../../Form';
import Button from '../../Form/Button';
import { useForm } from 'react-hook-form';
import { container_planting_depth, container_plant_spacing, getDefaultUnit, seedYield } from '../../../util/unit';
import clsx from 'clsx';
import convert from 'convert-units';
import Unit, { unitOptionMap } from '../../Form/Unit';
import MultiStepPageTitle from '../../PageTitle/MultiStepPageTitle';
import RadioGroup from '../../Form/RadioGroup';
import { cloneObject } from '../../../util';

export default function PureRowMethod({
  onGoBack,
  onCancel,
  onCotinue,
  system,
}) {

  const { t } = useTranslation(['translation']);
  const {
    register,
    handleSubmit,
    getValues,
    watch,
    control,
    setValue,
    setError,
    formState: { errors, isValid },
  } = useForm({
    shouldUnregister: false,
    mode: 'onBlur',
  });

  const progress = 75;

  const row_prefix = 'row_method.'

  const SAME_LENGTH = row_prefix +'same_length';
  const NUMBER_OF_ROWS = row_prefix + 'number_of_rows';
  const LENGTH_OF_ROW = row_prefix + 'length_of_row';
  const LENGTH_OF_ROW_UNIT = row_prefix + 'length_of_row_unit';
  const PLANT_SPACING = row_prefix + 'plant_spacing';
  const PLANT_SPACING_UNIT = row_prefix + 'plant_spacing_unit';
  const TOTAL_LENGTH = row_prefix + 'total_length';
  const TOTAL_LENGTH_UNIT = row_prefix + 'total_length_unit';

  const same_length = watch(SAME_LENGTH);

  return (
    <Form
      buttonGroup={
        <Button type={'submit'} disabled={!isValid} fullLength>
          {t('common:CONTINUE')}
        </Button>
      }
      onSubmit={handleSubmit(onCotinue)}
    >
      <MultiStepPageTitle
        onGoBack={onGoBack}
        onCancel={onCancel}
        value={progress}
        title={t('MANAGEMENT_PLAN.ADD_MANAGEMENT_PLAN')}
        style={{ marginBottom: '24px' }}
      />
      <Main style={{ paddingBottom: '24px' }}>
        {t('MANAGEMENT_PLAN.ROW_METHOD.SAME_LENGTH')}
      </Main>
      <div>
        <RadioGroup
          hookFormControl={control}
          name={SAME_LENGTH}
          required
        />
      </div>
      {(same_length === true || same_length === false) && (
        <>
          {same_length && (
            <>
              <div className={styles.row}>
                <Input
                  label={t('MANAGEMENT_PLAN.ROW_METHOD.NUMBER_OF_ROWS')}
                  hookFormRegister={register(NUMBER_OF_ROWS, {
                    required: true,
                    valueAsNumber: true,
                  })}
                  style={{ flexGrow: 1 }}
                  type={'number'}
                  onKeyDown={integerOnKeyDown}
                  max={999}
                />
                <Unit
                  style={{ paddingLeft: '16px' }}
                  register={register}
                  label={t('MANAGEMENT_PLAN.ROW_METHOD.LENGTH_OF_ROW')}
                  name={LENGTH_OF_ROW}
                  displayUnitName={LENGTH_OF_ROW_UNIT}
                  errors={errors[LENGTH_OF_ROW]}
                  unitType={container_planting_depth}
                  system={system}
                  hookFormSetValue={setValue}
                  hookFormGetValue={getValues}
                  hookFormSetError={setError}
                  hookFromWatch={watch}
                  control={control}
                  required
                  style={{ flexGrow: 1 }}
                />
              </div>
            </>
          )}
          {!same_length && (
            <div>
              <Unit
                  style={{ paddingLeft: '16px' }}
                  register={register}
                  label={t('MANAGEMENT_PLAN.ROW_METHOD.TOTAL_LENGTH')}
                  name={TOTAL_LENGTH}
                  displayUnitName={TOTAL_LENGTH_UNIT}
                  errors={errors[TOTAL_LENGTH]}
                  unitType={container_plant_spacing}
                  system={system}
                  hookFormSetValue={setValue}
                  hookFormGetValue={getValues}
                  hookFormSetError={setError}
                  hookFromWatch={watch}
                  control={control}
                  required
                  style={{ flexGrow: 1 }}
                />
            </div>
          )}
          <div style={{ marginTop: '40px' }}>
                <Unit
                  style={{ paddingLeft: '16px' }}
                  register={register}
                  label={t('MANAGEMENT_PLAN.PLANT_SPACING')}
                  name={PLANT_SPACING}
                  displayUnitName={PLANT_SPACING_UNIT}
                  errors={errors[PLANT_SPACING]}
                  unitType={container_plant_spacing}
                  system={system}
                  hookFormSetValue={setValue}
                  hookFormGetValue={getValues}
                  hookFormSetError={setError}
                  hookFromWatch={watch}
                  control={control}
                  required
                  style={{ flexGrow: 1 }}
                />
          </div>
        </>
      )}
    </Form>
  );
}