import React from 'react';
import { useTranslation } from 'react-i18next';
import Form from '../../Form';
import MultiStepPageTitle from '../../PageTitle/MultiStepPageTitle';
import { Main } from '../../Typography';
import { useForm } from 'react-hook-form';
import Button from '../../Form/Button';
import PureCropTile from '../../CropTile';
import CropStatusInfoBox from '../../CropCatalogue/CropStatusInfoBox';
import PureManagementPlanTile from '../../CropTile/ManagementPlanTile';
import { useSelector } from 'react-redux';
import {
  managementPlansByLocationIdSelector,
  filterManagementPlansByLocationId,
} from '../../../containers/managementPlanSlice';

const PureTaskCrops = ({
  handleGoBack,
  handleCancel,
  onError,
  persistedFormData,
  onContinue,
  persistedPaths,
  useHookFormPersist,
}) => {
  const { t } = useTranslation();

  const {
    handleSubmit,
    getValues,
    watch,
    control,
    setValue,
    formState: { errors, isValid },
  } = useForm({
    mode: 'onChange',
  });

  useHookFormPersist(getValues, persistedPaths);

  console.log(persistedFormData);
  console.log(persistedFormData.task_locations);

  let location_id = persistedFormData.task_locations[0];
  console.log(location_id);

  const managementPlans = useSelector(managementPlansByLocationIdSelector(location_id));
  console.log(managementPlans);

  return (
    <>
      <Form
        buttonGroup={
          <div style={{ display: 'flex', flexDirection: 'column', rowGap: '16px', flexGrow: 1 }}>
            <Button color={'primary'} fullLength>
              {t('common:CONTINUE')}
            </Button>
          </div>
        }
        onSubmit={handleSubmit(onContinue, onError)}
      >
        <MultiStepPageTitle
          style={{ marginBottom: '24px' }}
          onGoBack={handleGoBack}
          onCancel={handleCancel}
          title={t('ADD_TASK.ADD_A_TASK')}
          cancelModalTitle={t('ADD_TASK.CANCEL')}
          value={57}
        />

        <Main style={{ paddingBottom: '20px' }}>{t('ADD_TASK.AFFECT_CROPS')}</Main>

        <PureCropTile></PureCropTile>
      </Form>
    </>
  );
};

export default PureTaskCrops;
