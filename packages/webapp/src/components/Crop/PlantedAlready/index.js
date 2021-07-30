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

  const progress = 12.5;

  const IN_GROUND = 'crop_management_plan.already_in_ground';
  const AGE = 'crop_management_plan.crop_age';
  const AGE_UNIT = 'crop_management_plan.crop_age_unit';
  //TODO: remove duplicate
  const SEEDLING_AGE = AGE;
  const SEEDLING_AGE_UNIT = AGE_UNIT;

  const IS_SEED = 'crop_management_plan.is_seed';
  const WILD_CROP = 'crop_management_plan.is_wild';

  const MAX_AGE = 999;

  const in_ground = watch(IN_GROUND);
  const is_seed = watch(IS_SEED);
  const wild_crop = watch(WILD_CROP);

  const disabled = !isValid || (in_ground === true && wild_crop !== true && wild_crop !== false);

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
        cancelModalTitle={t('MANAGEMENT_PLAN.MANAGEMENT_PLAN_FLOW')}
        title={t('MANAGEMENT_PLAN.ADD_MANAGEMENT_PLAN')}
        value={progress}
        style={{
          marginBottom: '24px',
        }}
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
                name={IS_SEED}
                radios={[
                  {
                    label: t('CROP_MANAGEMENT.SEED'),
                    value: true,
                  },
                  {
                    label: t('MANAGEMENT_PLAN.SEEDLING'),
                    value: false,
                  },
                ]}
                required
                shouldUnregister={false}
              />
              {is_seed === false && (
                <>
                  <div>
                    <Label className={styles.label} style={{ marginBottom: '23px' }}>
                      {t('MANAGEMENT_PLAN.SEEDLING_AGE')}
                    </Label>
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
                      hookFromWatch={watch}
                      control={control}
                      max={MAX_AGE}
                      toolTipContent={t('MANAGEMENT_PLAN.SEEDLING_AGE_INFO')}
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
                <RadioGroup hookFormControl={control} name={WILD_CROP} shouldUnregister={false} />
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
