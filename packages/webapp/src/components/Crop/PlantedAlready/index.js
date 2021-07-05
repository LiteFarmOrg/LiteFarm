import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import Form from '../../Form';
import { useForm } from 'react-hook-form';
import MultiStepPageTitle from '../../PageTitle/MultiStepPageTitle';
import RadioGroup from '../../Form/RadioGroup';
import Button from '../../Form/Button';
import Unit from '../../Form/Unit';
import { Label } from '../../Typography';
import Infoi from '../../Tooltip/Infoi';
import { crop_age } from '../../../util/unit';
import styles from './styles.module.scss';
import { cloneObject } from '../../../util';

export default function PurePlantedAlready({
  onSubmit,
  onGoBack,
  onCancel,
  useHookFormPersist,
  persistedFormData,
  system,
  persistPath,
}) {
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    watch,
    getValues,
    setValue,
    setError,
    control,
    formState: { errors, isValid },
  } = useForm({
    mode: 'onChange',
    shouldUnregister: false,
    defaultValues: cloneObject(persistedFormData),
  });

  useHookFormPersist([persistPath], getValues);

  const disabled = !isValid;

  const progress = 12.5;

  const IN_GROUND = 'in_ground';
  const AGE = 'age';
  const SEEDLING_AGE = 'seedling_age';
  const SEEDLING_AGE_UNIT = 'seedling_age_unit';
  const AGE_UNIT = 'age_unit';
  const SEEDING_TYPE = 'seeding_type';
  const WILD_CROP = 'wild_crop';

  const MAX_AGE = 999;

  const in_ground = watch(IN_GROUND);
  const seeding_type = watch(SEEDING_TYPE);

  return (
    <Form
      buttonGroup={
        <Button disabled={disabled} fullLength>
          {t('common:CONTINUE')}
        </Button>
      }
      onSubmit={handleSubmit(onSubmit)}
    >
      <MultiStepPageTitle
        onGoBack={onGoBack}
        onCancel={onCancel}
        title={t('MANAGEMENT_PLAN.ADD_MANAGEMENT_PLAN')}
        value={progress}
        style={{
          marginBottom: '24px',
        }}
        cancelModalTitle
      />

      <div>
        <div>
          <Label className={styles.label} style={{ marginBottom: '18px' }}>
            {t('MANAGEMENT_PLAN.PLANTED_ALREADY')}
          </Label>
        </div>
        <RadioGroup
          hookFormControl={control}
          style={{ marginBottom: '16px' }}
          name={IN_GROUND}
          radios={[
            {
              label: t('MANAGEMENT_PLAN.PLANTING'),
              value: false,
            },
            {
              label: t('MANAGEMENT_PLAN.IN_GROUND'),
              value: true,
            },
          ]}
          required
        />
      </div>
      {(in_ground === true || in_ground === false) && (
        <>
          {!in_ground && (
            <>
              <Label className={styles.label} style={{ marginBottom: '18px' }}>
                {t('MANAGEMENT_PLAN.SEED_OR_SEEDLING')}
              </Label>
              <RadioGroup
                style={{ marginBottom: '32px' }}
                hookFormControl={control}
                name={SEEDING_TYPE}
                radios={[
                  {
                    label: t('CROP_MANAGEMENT.SEED'),
                    value: 'SEED',
                  },
                  {
                    label: t('MANAGEMENT_PLAN.SEEDLING'),
                    value: 'SEEDLING_OR_PLANTING_STOCK',
                  },
                ]}
                required
              />
              {seeding_type === 'SEEDLING_OR_PLANTING_STOCK' && (
                <>
                  <div>
                    <Label className={styles.label} style={{ marginBottom: '23px' }}>
                      {t('MANAGEMENT_PLAN.SEEDLING_AGE')}
                    </Label>
                    <Infoi
                      style={{ fontSize: '18px', transform: 'translateY(3px)' }}
                      content={t('MANAGEMENT_PLAN.SEEDLING_AGE_INFO')}
                    />
                  </div>
                  <div>
                    <Unit
                      register={register}
                      label={t('MANAGEMENT_PLAN.AGE')}
                      name={SEEDLING_AGE}
                      displayUnitName={SEEDLING_AGE_UNIT}
                      errors={errors[SEEDLING_AGE]}
                      unitType={crop_age}
                      system={system}
                      hookFormSetValue={setValue}
                      hookFormGetValue={getValues}
                      hookFormSetError={setError}
                      hookFromWatch={watch}
                      control={control}
                      max={MAX_AGE}
                      optional
                    />
                  </div>
                </>
              )}
            </>
          )}
          {in_ground && (
            <>
              <Label className={styles.label} style={{ marginBottom: '24px' }}>
                {t('MANAGEMENT_PLAN.WHAT_IS_AGE')}
              </Label>
              <div style={{ marginBottom: '40px' }}>
                <Unit
                  register={register}
                  label={t('MANAGEMENT_PLAN.AGE')}
                  name={AGE}
                  displayUnitName={AGE_UNIT}
                  errors={errors[AGE]}
                  unitType={crop_age}
                  system={system}
                  hookFormSetValue={setValue}
                  hookFormGetValue={getValues}
                  hookFormSetError={setError}
                  hookFromWatch={watch}
                  control={control}
                  max={MAX_AGE}
                  optional
                />
              </div>
              <div>
                <Label className={styles.label} style={{ marginBottom: '18px' }}>
                  {t('MANAGEMENT_PLAN.WILD_CROP')}
                </Label>
                <RadioGroup hookFormControl={control} name={WILD_CROP} required />
              </div>
            </>
          )}
        </>
      )}
    </Form>
  );
}

PurePlantedAlready.prototype = {
  onSubmit: PropTypes.func,
  onGoBack: PropTypes.func,
  onCancel: PropTypes.func,
  useHookFormPersist: PropTypes.func,
  persistedFormData: PropTypes.object,
  system: PropTypes.oneOf(['imperial', 'metric']),
  persistPath: PropTypes.string,
};
