import React from 'react';
import { useTranslation } from 'react-i18next';
import Form from '../../Form';
import MultiStepPageTitle from '../../PageTitle/MultiStepPageTitle';
import { Main, Underlined } from '../../Typography';
import { useForm } from 'react-hook-form';
import Button from '../../Form/Button';
import PureManagementPlanTile from '../../CropTile/ManagementPlanTile';
import PureCropTileContainer from '../../CropTile/CropTileContainer';
import useCropTileListGap from '../../CropTile/useCropTileListGap';
import PageBreak from '../../PageBreak';
import clsx from 'clsx';
import styles from './styles.module.scss';
import Input from '../../Form/Input';
import Square from '../../Square';

const PureTaskCrops = ({
  handleGoBack,
  handleCancel,
  onError,
  persistedFormData,
  onContinue,
  persistedPaths,
  useHookFormPersist,
  managementPlansByLocationIds,
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
  let select_all_crops = false;

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
        <Input isSearchBar={true} style={{ paddingBottom: '25px' }} />

        <div style={{ paddingBottom: '16px' }}>
          <Square style={{ marginRight: '15px' }} color={'counter'}>
            {'0'}
          </Square>
          <Underlined style={{ marginRight: '5px' }}>{t('ADD_TASK.SELECT_ALL_CROPS')}</Underlined>
          {'|'}
          <Underlined style={{ marginLeft: '5px' }}>{t('ADD_TASK.CLEAR_ALL_CROPS')}</Underlined>
        </div>

        {Object.keys(managementPlansByLocationIds).map((location_id) => {
          let location_name =
            managementPlansByLocationIds[location_id][0].planting_management_plans.final.location
              .name;
          return (
            <>
              <PageBreak style={{ paddingBottom: '16px' }} label={location_name} />
              <div style={{ paddingBottom: '16px' }}>
                <Underlined>{t('ADD_TASK.SELECT_ALL')}</Underlined>
                {' | '}
                <Underlined>{t('ADD_TASK.CLEAR_ALL')}</Underlined>
              </div>
              <PureCropTileContainer gap={gap} padding={padding}>
                {managementPlansByLocationIds[location_id].map((plan) => {
                  return (
                    <PureManagementPlanTile
                      className={clsx(select_all_crops && styles.typeContainerSelected)}
                      managementPlan={plan}
                    />
                  );
                })}
              </PureCropTileContainer>
            </>
          );
        })}
      </Form>
    </>
  );
};

export default PureTaskCrops;
