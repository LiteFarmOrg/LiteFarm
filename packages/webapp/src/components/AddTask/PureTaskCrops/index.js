import React, { useMemo, useState } from 'react';
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
import Input from '../../Form/Input';
import Square from '../../Square';
import produce from 'immer';
import { cloneObject } from '../../../util';
import { getArrayWithUniqueValues } from '../../../util/getArrayWithUniqueValues';

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
    register,
    formState: { errors, isValid },
  } = useForm({
    mode: 'onChange',
    defaultValues: cloneObject(persistedFormData),
  });

  const { ref: containerRef, gap, padding, cardWidth } = useCropTileListGap([]);
  useHookFormPersist(getValues, persistedPaths);

  const [filter, setFilter] = useState();
  const onFilterChange = (e) => {
    setFilter(e.target.value);
  };

  const locationIds = Object.keys(managementPlansByLocationIds);
  const managementPlansFilteredByInput = useMemo(() => {
    if (!filter) {
      return managementPlansByLocationIds;
    } else {
      return locationIds.reduce((filteredManagementPlansByLocationId, locationId) => {
        filteredManagementPlansByLocationId[locationId] = managementPlansByLocationIds[
          locationId
        ].filter(
          (mp) =>
            mp.crop_variety_name.toLowerCase().includes(filter?.toLowerCase()) ||
            mp.crop_common_name.toLowerCase().includes(filter?.toLowerCase()),
        );
        return filteredManagementPlansByLocationId;
      }, {});
    }
  }, [filter, managementPlansByLocationIds]);

  const MANAGEMENT_PLANS = 'managementPlans';
  register(MANAGEMENT_PLANS, { required: false });
  let selected_management_plans = watch(MANAGEMENT_PLANS);

  const onSubmit = () => {
    setValue(
      MANAGEMENT_PLANS,
      selectedManagementPlanIds.map((management_plan_id) => ({ management_plan_id })),
    );
    onContinue();
  };
  const [selectedManagementPlanIds, setSelectedManagementPlanIds] = useState(
    (getValues(MANAGEMENT_PLANS) || []).map(
      (management_plan) => management_plan.management_plan_id,
    ),
  );
  const onSelectManagementPlan = (management_plan_id) => {
    setSelectedManagementPlanIds(
      produce(selectedManagementPlanIds, (selectedManagementPlanIds) => {
        if (selectedManagementPlanIds.includes(management_plan_id)) {
          selectedManagementPlanIds = selectedManagementPlanIds.splice(
            selectedManagementPlanIds.indexOf(management_plan_id),
            1,
          );
        }
        selectedManagementPlanIds.push(management_plan_id);
      }),
    );
  };

  const selectAllCrops = () => {
    setSelectedManagementPlanIds((prevManagementPlanIds) =>
      Object.keys(managementPlansFilteredByInput).reduce((managementPlanIds, location_id) => {
        managementPlanIds = [
          ...prevManagementPlanIds,
          ...managementPlanIds,
          ...managementPlansFilteredByInput[location_id].map(
            ({ management_plan_id }) => management_plan_id,
          ),
        ];
        return getArrayWithUniqueValues(managementPlanIds);
      }, []),
    );
  };

  const selectAllManagementPlansOfALocation = (location_id) => {
    setSelectedManagementPlanIds((prevManagementPlanIds) =>
      getArrayWithUniqueValues([
        ...prevManagementPlanIds,
        ...managementPlansFilteredByInput[location_id].map(
          ({ management_plan_id }) => management_plan_id,
        ),
      ]),
    );
  };

  const clearAllManagementPlansOfALocation = (location_id) => {
    const managementPlanIdsOfLocation = managementPlansFilteredByInput[location_id].map(
      ({ management_plan_id }) => management_plan_id,
    );
    setSelectedManagementPlanIds(
      selectedManagementPlanIds.filter(
        (management_plan_id) => !managementPlanIdsOfLocation.includes(management_plan_id),
      ),
    );
  };

  const clearAllCrops = () => {
    const managementPlanIds = Object.values(managementPlansFilteredByInput).reduce(
      (managementPlanIds, managementPlans) => [
        ...managementPlanIds,
        ...managementPlans.map(({ management_plan_id }) => management_plan_id),
      ],
      [],
    );
    setSelectedManagementPlanIds(
      selectedManagementPlanIds.filter(
        (management_plan_id) => !managementPlanIds.includes(management_plan_id),
      ),
    );
  };

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
        onSubmit={handleSubmit(onSubmit, onError)}
      >
        <MultiStepPageTitle
          style={{ marginBottom: '24px' }}
          onGoBack={() => {
            setValue(
              MANAGEMENT_PLANS,
              selectedManagementPlanIds.map((management_plan_id) => ({ management_plan_id })),
            );
            handleGoBack();
          }}
          onCancel={handleCancel}
          title={t('ADD_TASK.ADD_A_TASK')}
          cancelModalTitle={t('ADD_TASK.CANCEL')}
          value={57}
        />

        <Main style={{ paddingBottom: '20px' }}>{t('ADD_TASK.AFFECT_CROPS')}</Main>
        <Input
          value={filter}
          onChange={onFilterChange}
          isSearchBar={true}
          style={{ paddingBottom: '25px' }}
        />

        <div style={{ paddingBottom: '16px' }}>
          <Square style={{ marginRight: '15px' }} color={'counter'}>
            {selectedManagementPlanIds.length}
          </Square>
          <Underlined onClick={selectAllCrops} style={{ marginRight: '5px' }}>
            {t('ADD_TASK.SELECT_ALL_CROPS')}
          </Underlined>
          {'|'}
          <Underlined onClick={clearAllCrops} style={{ marginLeft: '5px' }}>
            {t('ADD_TASK.CLEAR_ALL_CROPS')}
          </Underlined>
        </div>

        {Object.keys(managementPlansFilteredByInput).map((location_id) => {
          let location_name =
            managementPlansByLocationIds[location_id][0].planting_management_plans.final.location
              .name;
          return (
            <>
              <div style={{ paddingBottom: '16px' }}>
                <PageBreak
                  style={{ paddingBottom: '16px' }}
                  label={location_name}
                  onSelectAll={() => selectAllManagementPlansOfALocation(location_id)}
                  onClearAll={() => clearAllManagementPlansOfALocation(location_id)}
                />
              </div>
              <PureCropTileContainer gap={gap} padding={padding}>
                {managementPlansFilteredByInput[location_id].map((managementPlan) => {
                  return (
                    <PureManagementPlanTile
                      key={managementPlan.management_plan_id}
                      isSelected={selectedManagementPlanIds.includes(
                        managementPlan.management_plan_id,
                      )}
                      onClick={() => onSelectManagementPlan(managementPlan.management_plan_id)}
                      managementPlan={managementPlan}
                      date={managementPlan.firstTaskDate}
                      status={managementPlan.status}
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
