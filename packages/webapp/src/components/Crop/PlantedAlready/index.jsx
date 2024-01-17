import React, { useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import Form from '../../Form';
import { get, useForm } from 'react-hook-form';
import MultiStepPageTitle from '../../PageTitle/MultiStepPageTitle';
import RadioGroup from '../../Form/RadioGroup';
import Button from '../../Form/Button';
import Unit from '../../Form/Unit';
import { Label } from '../../Typography';
import { crop_age, getDurationInDaysDefaultUnit } from '../../../util/convert-units/unit';
import styles from './styles.module.scss';
import { cloneObject } from '../../../util';
import { getDateDifference, getDateInputFormat } from '../../../util/moment';
import { getPlantedAlreadyPaths } from '../getAddManagementPlanPath';

export default function PurePlantedAlready({
  history,
  useHookFormPersist,
  persistedFormData,
  system,
  cropVariety,
  location,
}) {
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    watch,
    getValues,
    setValue,
    control,
    formState: { errors, isValid },
  } = useForm({
    mode: 'onChange',
    shouldUnregister: false,
    defaultValues: cloneObject(persistedFormData),
  });

  const { historyCancel } = useHookFormPersist(getValues);

  const progress = 12.5;

  const ALREADY_IN_GROUND = 'crop_management_plan.already_in_ground';
  const AGE = 'crop_management_plan.crop_age';
  const AGE_UNIT = 'crop_management_plan.crop_age_unit';
  //TODO: remove duplicate
  const SEEDLING_AGE = AGE;
  const SEEDLING_AGE_UNIT = AGE_UNIT;

  const IS_SEED = 'crop_management_plan.is_seed';
  const IS_WILD = 'crop_management_plan.is_wild';

  const MAX_AGE = 99999;
  const MAX_SEEDLING_AGE = 999;

  useEffect(() => {
    const persistedFormDataIsEmpty = Object.keys(persistedFormData).length === 0;
    if (persistedFormDataIsEmpty) {
      history.back();
    }

    if (persistedFormData.crop_management_plan?.seed_date) {
      const currentDate = getDateInputFormat(new Date());
      const newAge = getDateDifference(
        persistedFormData.crop_management_plan.seed_date,
        currentDate,
      );
      setValue(AGE, newAge);
      setValue(AGE_UNIT, getDurationInDaysDefaultUnit(newAge));
    }
  }, []);

  const { submitPath } = useMemo(() => getPlantedAlreadyPaths(cropVariety.crop_variety_id), []);

  const onSubmit = () => {
    const age = getValues(AGE);
    if ((already_in_ground || !is_seed) && age !== get(persistedFormData, AGE)) {
      const SEED_DATE = 'crop_management_plan.seed_date';
      if (age === 0 || age > 0) {
        const seedDate = new Date();
        seedDate.setDate(seedDate.getDate() - getValues(AGE));
        setValue(SEED_DATE, getDateInputFormat(seedDate));
      } else {
        setValue(SEED_DATE, undefined);
      }
    }

    const NEEDS_TRANSPLANT = 'crop_management_plan.needs_transplant';
    if (get(persistedFormData, NEEDS_TRANSPLANT) === undefined) {
      if (getValues(ALREADY_IN_GROUND)) {
        setValue(NEEDS_TRANSPLANT, false);
      } else if (getValues(IS_SEED) === false) {
        setValue(NEEDS_TRANSPLANT, true);
      } else {
        setValue(NEEDS_TRANSPLANT, cropVariety.needs_transplant);
      }
    }

    const FOR_COVER = 'crop_management_plan.for_cover';
    if (cropVariety.can_be_cover_crop && get(persistedFormData, FOR_COVER) === undefined) {
      setValue(FOR_COVER, true);
    } else if (!cropVariety.can_be_cover_crop) {
      setValue(FOR_COVER, false);
    }

    history.push(submitPath, location?.state);
  };
  const onGoBack = () => history.back();

  const already_in_ground = watch(ALREADY_IN_GROUND);
  const is_seed = watch(IS_SEED);

  const disabled = !isValid;

  return (
    <Form
      buttonGroup={
        <Button data-cy="cropPlan-submit" disabled={disabled} fullLength>
          {t('common:CONTINUE')}
        </Button>
      }
      onSubmit={handleSubmit(onSubmit)}
    >
      <MultiStepPageTitle
        onGoBack={onGoBack}
        onCancel={historyCancel}
        cancelModalTitle={t('MANAGEMENT_PLAN.MANAGEMENT_PLAN_FLOW')}
        title={t('MANAGEMENT_PLAN.ADD_MANAGEMENT_PLAN')}
        value={progress}
        style={{
          marginBottom: '24px',
        }}
      />

      <Label className={styles.label} style={{ marginBottom: '18px' }}>
        {t('MANAGEMENT_PLAN.PLANTED_ALREADY')}
      </Label>

      <RadioGroup
        data-cy="cropPlan-groundPlanted"
        hookFormControl={control}
        style={{ marginBottom: '16px' }}
        name={ALREADY_IN_GROUND}
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

      {already_in_ground === false && (
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
          />
          {is_seed === false && (
            <>
              <Label className={styles.label} style={{ marginBottom: '23px' }}>
                {t('MANAGEMENT_PLAN.SEEDLING_AGE')}
              </Label>

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
                max={MAX_SEEDLING_AGE}
                toolTipContent={t('MANAGEMENT_PLAN.SEEDLING_AGE_INFO')}
                required
              />
            </>
          )}
        </>
      )}
      {already_in_ground === true && (
        <>
          <Label className={styles.label} style={{ marginBottom: '24px' }}>
            {t('MANAGEMENT_PLAN.WHAT_IS_AGE')}
          </Label>

          <Unit
            data-cy="cropPlan-age"
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
            style={{ marginBottom: '40px' }}
            required
          />

          <Label className={styles.label} style={{ marginBottom: '18px' }}>
            {t('MANAGEMENT_PLAN.WILD_CROP')}
          </Label>
          <RadioGroup
            data-cy="cropPlan-wildCrop"
            hookFormControl={control}
            name={IS_WILD}
            required
          />
        </>
      )}
    </Form>
  );
}

PurePlantedAlready.prototype = {
  useHookFormPersist: PropTypes.func,
  persistedFormData: PropTypes.object,
  system: PropTypes.oneOf(['imperial', 'metric']),
  cropVariety: PropTypes.shape({
    needs_transplant: PropTypes.bool,
    can_be_cover_crop: PropTypes.bool,
    crop_variety_id: PropTypes.string,
  }),
};
