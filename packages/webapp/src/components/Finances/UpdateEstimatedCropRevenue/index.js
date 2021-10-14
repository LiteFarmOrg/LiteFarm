import React, { useEffect } from 'react';
// import styles from './styles.module.scss';
import Form from '../../Form';
import Button from '../../Form/Button';
import PageTitle from '../../PageTitle/v2';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { Semibold, Text } from '../../Typography';
import Input from '../../Form/Input';
import Unit from '../../Form/Unit';
import { seedYield } from '../../../util/unit';

function PureUpdateEstimatedCropRevenue({ system, plan, onGoBack, onSubmit }) {
  const { t } = useTranslation();

  const { crop, crop_variety, name } = plan;

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
        estimated_yield: plan.estimated_yield,
        estimated_yield_unit: plan.estimated_yield_unit,
        estimated_revenue: plan.estimated_revenue,
      },
    },
  });

  const ESTIMATED_PRICE_PER_UNIT = 'crop_management_plan.estimated_price_per_unit';
  const ESTIMATED_PRICE_PER_UNIT_UNIT = 'crop_management_plan.estimated_price_per_unit_unit';
  const ESTIMATED_ANNUAL_YIELD = 'crop_management_plan.estimated_yield';
  const ESTIMATED_ANNUAL_YIELD_UNIT = 'crop_management_plan.estimated_yield_unit';
  const ESTIMATED_ANNUAL_REVENUE = 'crop_management_plan.estimated_revenue';

  return (
    <Form
      onSubmit={handleSubmit(onSubmit)}
      buttonGroup={
        <Button disabled={false} fullLength type={'submit'}>
          {t('common:UPDATE')}
        </Button>
      }
    >
      <PageTitle title={'Estimated crop revenue'} onGoBack={onGoBack} />

      <Semibold>
        {`${crop_variety.crop_variety_name}, ${t(`crop:${crop.crop_translation_key}`)}`}
      </Semibold>

      <Text>{name}</Text>

      <Unit
        register={register}
        label={t('FINANCES.ESTIMATED_REVENUE.ESTIMATED_PRICE_PER_UNIT')}
        name={ESTIMATED_PRICE_PER_UNIT}
        displayUnitName={ESTIMATED_PRICE_PER_UNIT_UNIT}
        unitType={seedYield}
        system={system}
        hookFormSetValue={setValue}
        hookFormGetValue={getValues}
        hookFromWatch={watch}
        control={control}
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
      />
      <Input
        label={t('FINANCES.ESTIMATED_REVENUE.ESTIMATED_ANNUAL_REVENUE')}
        type="number"
        hookFormRegister={register(ESTIMATED_ANNUAL_REVENUE, {
          required: true,
        })}
        // style={{ marginBottom: '28px' }}
        // errors={errors[ESTIMATED_ANNUAL_REVENUE]}
      />
    </Form>
  );
}

export default PureUpdateEstimatedCropRevenue;
