import Button from '../../Form/Button';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Label, Main } from '../../Typography';
import Form from '../../Form';
import { useForm } from 'react-hook-form';
import MultiStepPageTitle from '../../PageTitle/MultiStepPageTitle';
import RadioGroup from '../../Form/RadioGroup';
import { cloneObject } from '../../../util';
import { getTransplantPaths } from '../getAddManagementPlanPath';
import { useNavigate, useParams } from 'react-router';

export default function PureTransplant({
  can_be_cover_crop,
  useHookFormPersist,
  persistedFormData,
}) {
  let navigate = useNavigate();
  let { variety_id } = useParams();
  const { t } = useTranslation();

  const progress = 25;
  const TRANSPLANT = 'crop_management_plan.needs_transplant';
  const FOR_COVER = 'crop_management_plan.for_cover';

  const {
    handleSubmit,
    getValues,
    control,
    setValue,
    formState: { isValid },
  } = useForm({
    mode: 'onChange',
    shouldUnregister: false,
    defaultValues: cloneObject(persistedFormData),
  });

  const { historyCancel } = useHookFormPersist(getValues);

  const { submitPath } = getTransplantPaths(variety_id);
  const onSubmit = () => {
    navigate(submitPath);
  };
  const onGoBack = () => navigate(-1);

  const disabled = !isValid;

  return (
    <Form
      buttonGroup={
        <Button data-cy="cropPlan-transplantSubmit" disabled={disabled} fullLength>
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

      <Label
        style={{
          paddingRight: '10px',
          fontSize: '16px',
          lineHeight: '20px',
          display: 'inline-block',
          marginBottom: '18px',
        }}
      >
        {t('MANAGEMENT_PLAN.IS_TRANSPLANT')}
      </Label>

      <RadioGroup
        data-cy="cropPlan-transplanted"
        hookFormControl={control}
        name={TRANSPLANT}
        required
      />

      {can_be_cover_crop && (
        <>
          <Main
            style={{ marginTop: '16px', marginBottom: '18px' }}
            tooltipContent={t('MANAGEMENT_PLAN.COVER_INFO')}
          >
            {' '}
            {t('MANAGEMENT_PLAN.COVER_OR_HARVEST')}
          </Main>
          <RadioGroup
            data-cy="cropPlan-coverCrop"
            hookFormControl={control}
            name={FOR_COVER}
            required={!can_be_cover_crop}
            radios={[
              {
                label: t('MANAGEMENT_PLAN.AS_COVER_CROP'),
                value: true,
              },
              { label: t('MANAGEMENT_PLAN.FOR_HARVEST'), value: false },
            ]}
          />
        </>
      )}
    </Form>
  );
}

PureTransplant.prototype = {
  can_be_cover_crop: PropTypes.bool,
  onGoBack: PropTypes.func,
  onCancel: PropTypes.func,
  persistedFormData: PropTypes.object,
  useHookFormPersist: PropTypes.func,
};
