import Button from '../Form/Button';
import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Main } from '../Typography';
import Input from '../Form/Input';
import Form from '../Form';
import { useForm } from 'react-hook-form';
import MultiStepPageTitle from '../PageTitle/MultiStepPageTitle';
import RadioGroup from '../Form/RadioGroup';
import Unit from '../Form/Unit';
import { container_plant_spacing, container_planting_depth } from '../../util/unit';
import styles from './styles.module.scss';

export default function PurePlantInContainer({
  onSubmit,
  onError,
  onGoBack,
  onCancel,
  useHookFormPersist,
  system,
}) {
  const { t } = useTranslation();
  const IN_GROUND = 'seed_date';
  const NUMBER_OF_CONTAINER = 'number_of_container';
  const PLANTS_PER_CONTAINER = 'plants_per_container';
  const PLANT_SPACING = 'plant_spacing';
  const PLANT_SPACING_UNIT = 'plant_spacing_unit';
  const TOTAL_PLANTS = 'total_plants';
  const PLANTING_DEPTH = 'planting_depth';
  const PLANTING_DEPTH_UNIT = 'planting_depth_unit';
  const PLANTING_SOIL = 'planting_soil';
  const CONTAINER_TYPE = 'container_type';
  const PLANTING_NOTE = 'planting_notes';
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
    mode: 'onChange',
    shouldUnregister: true,
  });

  const in_ground = watch(IN_GROUND);

  const disabled = !isValid;

  return (
    <Form
      buttonGroup={
        <Button disabled={disabled} fullLength>
          {t('common:CONTINUE')}
        </Button>
      }
      onSubmit={handleSubmit(onSubmit, onError)}
    >
      <MultiStepPageTitle
        onGoBack={onGoBack}
        onCancel={onCancel}
        title={t('MANAGEMENT_PLAN.ADD_MANAGEMENT_PLAN')}
        value={15}
        style={{ marginBottom: '24px' }}
      />
      <Main style={{ marginBottom: '24px' }}>{t('MANAGEMENT_PLAN.CONTAINER_OR_IN_GROUND')}</Main>
      <RadioGroup
        hookFormControl={control}
        name={IN_GROUND}
        radios={[
          {
            label: t('MANAGEMENT_PLAN.CONTAINER'),
            value: false,
          },
          { label: t('MANAGEMENT_PLAN.IN_GROUND'), value: true },
        ]}
        required
        style={{ paddingBottom: '16px' }}
      />
      {(in_ground === true || in_ground === false) && (
        <>
          {!in_ground && (
            <div className={styles.row}>
              <Input
                label={t('MANAGEMENT_PLAN.NUMBER_OF_CONTAINER')}
                hookFormRegister={register(NUMBER_OF_CONTAINER)}
                style={{ flexGrow: 1 }}
              />
              <Input
                label={t('MANAGEMENT_PLAN.PLANTS_PER_CONTAINER')}
                hookFormRegister={register(PLANTS_PER_CONTAINER)}
                style={{ flexGrow: 1 }}
              />
            </div>
          )}
          {in_ground && (
            <Input
              label={t('MANAGEMENT_PLAN.TOTAL_PLANTS')}
              hookFormRegister={register(TOTAL_PLANTS)}
              style={{ paddingBottom: '40px' }}
            />
          )}

          <div className={styles.row}>
            <Unit
              register={register}
              label={t('MANAGEMENT_PLAN.PLANTING_DEPTH')}
              name={PLANTING_DEPTH}
              displayUnitName={PLANTING_DEPTH_UNIT}
              errors={errors[PLANTING_DEPTH]}
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
            {in_ground && (
              <Unit
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
            )}
          </div>

          {!in_ground && (
            <>
              <Input
                label={t('MANAGEMENT_PLAN.PLANTING_SOIL')}
                hookFormRegister={register(PLANTING_SOIL)}
                style={{ paddingBottom: '40px' }}
                optional
                hasLeaf
              />
              <Input
                label={t('MANAGEMENT_PLAN.CONTAINER_TYPE')}
                hookFormRegister={register(CONTAINER_TYPE)}
                style={{ paddingBottom: '40px' }}
                optional
              />
            </>
          )}

          <Input
            label={t('MANAGEMENT_PLAN.PLANTING_NOTE')}
            hookFormRegister={register(PLANTING_NOTE)}
            optional
          />
        </>
      )}
    </Form>
  );
}

PurePlantInContainer.prototype = {
  history: PropTypes.object,
  match: PropTypes.object,
  onSubmit: PropTypes.func,
  onError: PropTypes.func,
  useHookFormPersist: PropTypes.func,
  persistedFormData: PropTypes.object,
};
