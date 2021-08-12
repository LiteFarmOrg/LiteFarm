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
import { managementPlansByLocationIdSelector } from '../../../containers/managementPlanSlice';
import PureCropTileContainer from '../../CropTile/CropTileContainer';
import useCropTileListGap from '../../CropTile/useCropTileListGap';
import PageBreak from '../../PageBreak';

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

  const { ref: containerRef, gap, padding, cardWidth } = useCropTileListGap([]);

  useHookFormPersist(getValues, persistedPaths);
  const managementPlans = useSelector(
    managementPlansByLocationIdSelector(persistedFormData.task_locations[0]),
  );

  let task_locations = [];
  for (let location of persistedFormData.task_locations) {
    task_locations.push(location);
  }
  console.log(persistedFormData.task_locations[0]);
  console.log(managementPlans);

  //let management_plans = useSelector(managementPlansByLocationIdSelector(location)); // all the management plans for a location

  // let map = new Map();
  // for (let location of task_locations) {
  //   let management_plans = useSelector(managementPlansByLocationIdSelector(location));
  //   map.set(location, management_plans);
  // }

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

        {task_locations.map((location) => {
          return (
            <>
              <PageBreak style={{ paddingBottom: '16px' }} label={location} />
              <PureCropTileContainer gap={gap} padding={padding}>
                {managementPlans.map((plan) => {
                  return <PureManagementPlanTile status={'Active'} managementPlan={plan} />;
                })}
              </PureCropTileContainer>
            </>
          );
        })}

        <>
          <PageBreak style={{ paddingBottom: '16px' }} label={'location 1'} />
          <PureCropTileContainer gap={gap} padding={padding}>
            {managementPlans.map((plan) => {
              return <PureManagementPlanTile status={'Active'} managementPlan={plan} />;
            })}
          </PureCropTileContainer>
        </>
      </Form>
    </>
  );
};

export default PureTaskCrops;
