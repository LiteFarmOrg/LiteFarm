import { useTranslation } from 'react-i18next';
import Form from '../../Form';
import Button from '../../Form/Button';
import { useForm } from 'react-hook-form';
import MultiStepPageTitle from '../../PageTitle/MultiStepPageTitle';
import { cloneObject } from '../../../util';
import PropTypes from 'prop-types';
import PureRowForm from './PureRowForm';
import { useLocation, useNavigate } from 'react-router';

export default function PureRowMethod({
  system,
  crop_variety,
  useHookFormPersist,
  persistedFormData,
  isFinalPage,
  prefix = `crop_management_plan.planting_management_plans.${isFinalPage ? 'final' : 'initial'}`,
  submitPath,
  isHistoricalPage,
}) {
  let navigate = useNavigate();
  let location = useLocation();
  const onGoBack = () => navigate(-1);
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    getValues,
    watch,
    control,
    setValue,
    formState: { errors, isValid },
  } = useForm({
    shouldUnregister: false,
    mode: 'onChange',
    defaultValues: cloneObject(persistedFormData),
  });

  const { historyCancel } = useHookFormPersist(getValues);

  const onSubmit = () => navigate(submitPath, { state: location.state });

  return (
    <Form
      buttonGroup={
        <Button data-cy="rowMethod-submit" type={'submit'} disabled={!isValid} fullLength>
          {t('common:CONTINUE')}
        </Button>
      }
      onSubmit={handleSubmit(onSubmit)}
    >
      <MultiStepPageTitle
        onGoBack={onGoBack}
        onCancel={historyCancel}
        cancelModalTitle={t('MANAGEMENT_PLAN.MANAGEMENT_PLAN_FLOW')}
        value={isFinalPage ? 75 : 55}
        title={t('MANAGEMENT_PLAN.ADD_MANAGEMENT_PLAN')}
        style={{ marginBottom: '24px' }}
      />

      <PureRowForm
        prefix={prefix}
        isFinalPage={isFinalPage}
        system={system}
        crop_variety={crop_variety}
        isHistoricalPage={isHistoricalPage}
        persistedFormData={persistedFormData}
        {...{
          register,
          handleSubmit,
          getValues,
          watch,
          control,
          setValue,
          errors,
        }}
      />
    </Form>
  );
}

PureRowMethod.prototype = {
  useHookFormPersist: PropTypes.func,
  persistedFormData: PropTypes.object,
  crop_variety: PropTypes.object,
  system: PropTypes.oneOf(['imperial', 'metric']),
  isFinalPage: PropTypes.bool,
  submitPath: PropTypes.string,
};
