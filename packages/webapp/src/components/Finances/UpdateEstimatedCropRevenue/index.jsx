import React, { useEffect } from 'react';
// import styles from './styles.module.scss';
import Form from '../../Form';
import Button from '../../Form/Button';
import PageTitle from '../../PageTitle/v2';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { Semibold, Text } from '../../Typography';
import Input, { getInputErrors } from '../../Form/Input';
import Unit from '../../Form/Unit';
import { pricePerSeedYield, seedYield, roundToTwoDecimal } from '../../../util/convert-units/unit';
import { useCurrencySymbol } from '../../../containers/hooks/useCurrencySymbol';

function PureUpdateEstimatedCropRevenue({ system, managementPlan, onGoBack, onSubmit }) {
  const { t } = useTranslation();

  const {
    crop,
    crop_variety,
    estimated_price_per_mass,
    estimated_price_per_mass_unit,
    estimated_revenue,
    estimated_yield,
    estimated_yield_unit,
    name,
  } = managementPlan;

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
    defaultValues: {
      crop_management_plan: {
        estimated_price_per_mass,
        estimated_price_per_mass_unit,
        estimated_yield,
        estimated_yield_unit,
        estimated_revenue,
      },
    },
  });

  const ESTIMATED_PRICE_PER_UNIT = 'crop_management_plan.estimated_price_per_mass';
  const ESTIMATED_PRICE_PER_UNIT_UNIT = 'crop_management_plan.estimated_price_per_mass_unit';
  const ESTIMATED_ANNUAL_YIELD = 'crop_management_plan.estimated_yield';
  const ESTIMATED_ANNUAL_YIELD_UNIT = 'crop_management_plan.estimated_yield_unit';
  const ESTIMATED_ANNUAL_REVENUE = 'crop_management_plan.estimated_revenue';

  const disabled = !isValid;
  const pricePerMass = watch(ESTIMATED_PRICE_PER_UNIT);
  const annualYield = watch(ESTIMATED_ANNUAL_YIELD);

  // Calculate Revenue
  useEffect(() => {
    if (pricePerMass && annualYield) {
      setValue(ESTIMATED_ANNUAL_REVENUE, roundToTwoDecimal(annualYield * pricePerMass));
    }
  }, [pricePerMass, annualYield]);

  const cropText = crop_variety.crop_variety_name
    ? `${crop_variety.crop_variety_name}, ${t(`crop:${crop.crop_translation_key}`)}`
    : t(`crop:${crop.crop_translation_key}`);

  return (
    <Form
      onSubmit={handleSubmit(onSubmit)}
      buttonGroup={
        <Button disabled={disabled} fullLength type={'submit'}>
          {t('common:UPDATE')}
        </Button>
      }
    >
      <PageTitle
        title={t('FINANCES.ESTIMATED_REVENUE.ESTIMATED_CROP_REVENUE')}
        onGoBack={onGoBack}
        style={{ marginBottom: '24px' }}
      />

      <Semibold style={{ color: 'var(--teal700)' }}>{cropText}</Semibold>

      <Text style={{ marginBottom: '24px', color: 'var(--teal700)' }}>{name}</Text>

      <Unit
        register={register}
        label={t('FINANCES.ESTIMATED_REVENUE.ESTIMATED_PRICE_PER_UNIT')}
        name={ESTIMATED_PRICE_PER_UNIT}
        displayUnitName={ESTIMATED_PRICE_PER_UNIT_UNIT}
        unitType={pricePerSeedYield}
        system={system}
        hookFormSetValue={setValue}
        hookFormGetValue={getValues}
        hookFromWatch={watch}
        control={control}
        currency={useCurrencySymbol()}
        style={{ marginBottom: '40px' }}
      />
      <Unit
        register={register}
        label={t('FINANCES.ESTIMATED_REVENUE.ESTIMATED_ANNUAL_YIELD')}
        name={ESTIMATED_ANNUAL_YIELD}
        displayUnitName={ESTIMATED_ANNUAL_YIELD_UNIT}
        errors={errors[ESTIMATED_ANNUAL_YIELD]}
        unitType={seedYield}
        system={system}
        hookFormSetValue={setValue}
        hookFormGetValue={getValues}
        hookFromWatch={watch}
        control={control}
        required
        style={{ marginBottom: '40px' }}
      />
      <Input
        label={t('FINANCES.ESTIMATED_REVENUE.ESTIMATED_ANNUAL_REVENUE')}
        type="number"
        hookFormRegister={register(ESTIMATED_ANNUAL_REVENUE, {
          required: true,
          valueAsNumber: true,
        })}
        currency={useCurrencySymbol()}
        errors={getInputErrors(errors, ESTIMATED_ANNUAL_REVENUE)}
        style={{ marginBottom: '40px' }}
      />
    </Form>
  );
}

export default PureUpdateEstimatedCropRevenue;
