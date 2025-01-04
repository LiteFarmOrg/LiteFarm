import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import Form from '../../Form';
import { useForm } from 'react-hook-form';
import MultiStepPageTitle from '../../PageTitle/MultiStepPageTitle';
import Button from '../../Form/Button';
import Unit from '../../Form/Unit';
import { Label } from '../../Typography';
import Input from '../../Form/Input';
import { seedYield } from '../../../util/convert-units/unit';
import { cloneObject } from '../../../util';
import styles from './styles.module.scss';
import { getNextHarvestPaths } from '../getAddManagementPlanPath';
import { useNavigate } from 'react-router';

export default function PureNextHarvest({
  system,
  persistedFormData,
  useHookFormPersist,
  crop_variety,
}) {
  let navigate = useNavigate();
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
  const { historyCancel } = useHookFormPersist(getValues);

  const progress = 37.5;

  const HARVEST_DATE = 'crop_management_plan.harvest_date';
  const TERMINATION_DATE = 'crop_management_plan.termination_date';
  const [MAIN_DATE, title] = useMemo(() => {
    if (persistedFormData.crop_management_plan.for_cover) {
      return [TERMINATION_DATE, t('MANAGEMENT_PLAN.TERMINATION_DATE')];
    } else {
      return [HARVEST_DATE, t('MANAGEMENT_PLAN.NEXT_HARVEST')];
    }
  }, []);

  const ESTIMATED_YIELD = 'crop_management_plan.estimated_yield';
  const ESTIMATED_YIELD_UNIT = 'crop_management_plan.estimated_yield_unit';

  const { submitPath } = useMemo(
    () => getNextHarvestPaths(crop_variety.crop_variety_id, persistedFormData),
    [],
  );
  const onSubmit = () => navigate(submitPath);
  const onGoBack = () => navigate(-1);

  const showEstimatedYield = !persistedFormData.crop_management_plan.for_cover;

  const todayStr = new Date().toISOString().substring(0, 10);

  return (
    <Form
      buttonGroup={
        <Button disabled={!isValid} fullLength>
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

      <div>
        <Label className={styles.label} style={{ marginBottom: '24px' }}>
          {title}
        </Label>

        <Input
          style={{ marginBottom: '40px' }}
          type={'date'}
          label={t('common:DATE')}
          hookFormRegister={register(MAIN_DATE, {
            required: true,
          })}
          errors={errors[MAIN_DATE] && t('common:REQUIRED')}
          min={todayStr}
        />
        {showEstimatedYield && (
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
            max={999}
            optional
          />
        )}
      </div>
    </Form>
  );
}

PureNextHarvest.prototype = {
  system: PropTypes.string,
  persistedFormData: PropTypes.object,
  useHookFormPersist: PropTypes.func,
  crop_variety: PropTypes.object,
};
