import Button from '../../Form/Button';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import Form from '../../Form';
import { useForm } from 'react-hook-form';
import MultiStepPageTitle from '../../PageTitle/MultiStepPageTitle';
import { cloneObject } from '../../../util';
import { PurePlantingMethod } from '../../Crop/PlantingMethod/PurePlantingMethod';
import { useNavigate } from 'react-router';

export function PureTaskPlantingMethod({ useHookFormPersist, persistedFormData, location }) {
  let navigate = useNavigate();
  const { t } = useTranslation();

  const {
    handleSubmit,
    getValues,
    watch,
    control,
    formState: { errors, isValid },
  } = useForm({
    mode: 'onChange',
    shouldUnregister: false,
    defaultValues: cloneObject(persistedFormData),
  });

  const PLANTING_METHOD = `transplant_task.planting_management_plan.planting_method`;
  const planting_method = watch(PLANTING_METHOD);

  useHookFormPersist(getValues);

  const onError = () => {};

  const onSubmit = () =>
    navigate(`/add_task/${planting_method.toLowerCase()}`, { state: location.state });
  const onGoBack = () => navigate(-1);
  const { historyCancel } = useHookFormPersist(getValues);

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
        onCancel={historyCancel}
        cancelModalTitle={t('ADD_TASK.CANCEL')}
        title={t('ADD_TASK.ADD_A_TASK')}
        value={62.5}
        style={{ marginBottom: '24px' }}
      />

      <PurePlantingMethod
        planting_method={planting_method}
        PLANTING_METHOD={PLANTING_METHOD}
        title={t('ADD_TASK.WHAT_PLANTING_METHOD')}
        control={control}
      />
    </Form>
  );
}

PureTaskPlantingMethod.prototype = {
  useHookFormPersist: PropTypes.func,
  persistedFormData: PropTypes.object,
};
