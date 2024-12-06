import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Form from '../../Form';
import MultiStepPageTitle from '../../PageTitle/MultiStepPageTitle';
import { Main, Underlined } from '../../Typography';
import { useForm } from 'react-hook-form';
import Button from '../../Form/Button';
import PureManagementPlanTile from '../../CropTile/ManagementPlanTile';
import PureCropTileContainer from '../../CropTile/CropTileContainer';
import PageBreak from '../../PageBreak';
import Input from '../../Form/Input';
import Square from '../../Square';
import produce from 'immer';
import { cloneObject } from '../../../util';
import { getArrayWithUniqueValues } from '../../../util/getArrayWithUniqueValues';

const PureTaskCrops = ({
  handleGoBack,
  onError,
  persistedFormData,
  onContinue,
  useHookFormPersist,
  managementPlansByLocationIds,
  wildManagementPlanTiles,
  isMulti = true,
  isRequired,
  defaultManagementPlanId,
  progress = 57,
  history,
  location,
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
  //TODO managementPlans should be an array or management_plan_id
  const { historyCancel } = useHookFormPersist(getValues);

  const [filter, setFilter] = useState();
  const onFilterChange = (e) => {
    setFilter(e.target.value);
  };

  const locationIds = Object.keys(managementPlansByLocationIds);

  const filterManagementPlansByCropVarietyName = (mp) =>
    mp?.crop_variety_name?.toLowerCase().includes(filter?.trim()?.toLowerCase()) ||
    t(`crop:${mp?.crop?.crop_translation_key}`)
      ?.toLowerCase()
      .includes(filter?.trim()?.toLowerCase());

  const managementPlansFilteredByInput = useMemo(() => {
    if (!filter) {
      return managementPlansByLocationIds;
    } else {
      return locationIds.reduce((filteredManagementPlansByLocationId, locationId) => {
        filteredManagementPlansByLocationId[locationId] = managementPlansByLocationIds[
          locationId
        ]?.filter(filterManagementPlansByCropVarietyName);
        return filteredManagementPlansByLocationId;
      }, {});
    }
  }, [filter, managementPlansByLocationIds]);

  const wildCropTilesFilteredByInput = useMemo(() => {
    if (!filter) return wildManagementPlanTiles;
    else return wildManagementPlanTiles?.filter(filterManagementPlansByCropVarietyName);
  }, [wildManagementPlanTiles, filter]);

  const MANAGEMENT_PLANS = 'managementPlans';
  register(MANAGEMENT_PLANS, { required: false });

  const onSubmit = () => {
    setValue(
      MANAGEMENT_PLANS,
      selectedManagementPlanIds.map((management_plan_id) => ({ management_plan_id })),
    );
    onContinue();
  };

  const managementPlanIds = useMemo(() => {
    const locationManagementPlans = Object.keys(managementPlansByLocationIds).reduce(
      (managementPlanIds, location_id) => {
        return [
          ...managementPlanIds,
          ...managementPlansByLocationIds[location_id].map(
            ({ management_plan_id }) => management_plan_id,
          ),
        ];
      },
      [],
    );

    const wildManagementPlanIds =
      wildManagementPlanTiles?.map(({ management_plan_id }) => management_plan_id) || [];
    return [...locationManagementPlans, ...wildManagementPlanIds];
  }, []);

  const [selectedManagementPlanIds, setSelectedManagementPlanIds] = useState(
    isMulti
      ? (getValues(MANAGEMENT_PLANS) || [])
          .map((management_plan) => management_plan.management_plan_id)
          .filter((management_plan_id) => managementPlanIds.includes(management_plan_id))
      : getValues(MANAGEMENT_PLANS)?.length
        ? [getValues(MANAGEMENT_PLANS)?.[0]?.management_plan_id]
        : [],
  );

  const onSelectManagementPlan = (management_plan_id) => {
    setSelectedManagementPlanIds((selectedManagementPlanIds) => {
      if (!isMulti) {
        return [management_plan_id];
      } else {
        return produce(selectedManagementPlanIds, (selectedManagementPlanIds) => {
          if (selectedManagementPlanIds.includes(management_plan_id)) {
            selectedManagementPlanIds = selectedManagementPlanIds.splice(
              selectedManagementPlanIds.indexOf(management_plan_id),
              1,
            );
          }
          selectedManagementPlanIds.push(management_plan_id);
        });
      }
    });
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
    selectAllWildManagementPlans();
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

  const selectAllWildManagementPlans = () => {
    wildCropTilesFilteredByInput?.length &&
      setSelectedManagementPlanIds((prevManagementPlanIds) =>
        getArrayWithUniqueValues([
          ...prevManagementPlanIds,
          ...wildCropTilesFilteredByInput.map(({ management_plan_id }) => management_plan_id),
        ]),
      );
  };

  const clearAllWildManagementPlans = () => {
    const managementPlanIds = wildCropTilesFilteredByInput?.map(
      ({ management_plan_id }) => management_plan_id,
    );
    managementPlanIds?.length &&
      setSelectedManagementPlanIds(
        selectedManagementPlanIds.filter(
          (management_plan_id) => !managementPlanIds.includes(management_plan_id),
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
    const wildManagementPlanIds = wildCropTilesFilteredByInput?.map(
      ({ management_plan_id }) => management_plan_id,
    );
    setSelectedManagementPlanIds(
      selectedManagementPlanIds.filter(
        (management_plan_id) =>
          !managementPlanIds.includes(management_plan_id) &&
          !wildManagementPlanIds?.includes(management_plan_id),
      ),
    );
  };

  const disabled = isRequired && !selectedManagementPlanIds?.length;

  useEffect(() => {
    if (defaultManagementPlanId && managementPlanIds.includes(+defaultManagementPlanId)) {
      setSelectedManagementPlanIds([parseInt(defaultManagementPlanId)]);
    }
  }, []);

  return (
    <>
      <Form
        buttonGroup={
          <div style={{ display: 'flex', flexDirection: 'column', rowGap: '16px', flexGrow: 1 }}>
            <Button
              data-cy="addTask-cropsContinue"
              disabled={disabled}
              color={'primary'}
              fullLength
            >
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
          onCancel={historyCancel}
          title={t('ADD_TASK.ADD_A_TASK')}
          cancelModalTitle={t('ADD_TASK.CANCEL')}
          value={progress}
        />

        <Main style={{ paddingBottom: '20px' }}>{t('ADD_TASK.AFFECT_PLANS')}</Main>
        <Input
          value={filter}
          onChange={onFilterChange}
          isSearchBar={true}
          style={{ paddingBottom: '25px' }}
        />

        {isMulti && (
          <div style={{ paddingBottom: '16px' }}>
            <Square style={{ marginRight: '15px' }} color={'counter'}>
              {selectedManagementPlanIds.length}
            </Square>
            <Underlined onClick={selectAllCrops} style={{ marginRight: '5px' }}>
              {t('ADD_TASK.SELECT_ALL_PLANS')}
            </Underlined>
            {'|'}
            <Underlined onClick={clearAllCrops} style={{ marginLeft: '5px' }}>
              {t('ADD_TASK.CLEAR_ALL_PLANS')}
            </Underlined>
          </div>
        )}

        {Object.keys(managementPlansFilteredByInput).map((location_id) => {
          let location_name = managementPlansByLocationIds[location_id][0].location.name;
          return (
            <div key={location_id}>
              <PageBreak
                style={{ paddingBottom: '16px' }}
                label={location_name}
                onSelectAll={
                  isMulti ? () => selectAllManagementPlansOfALocation(location_id) : undefined
                }
                onClearAll={
                  isMulti ? () => clearAllManagementPlansOfALocation(location_id) : undefined
                }
              />
              <PureCropTileContainer gap={24} padding={0}>
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
            </div>
          );
        })}
        {wildCropTilesFilteredByInput?.length > 0 && (
          <div>
            <PageBreak
              style={{ paddingBottom: '16px' }}
              label={t('ADD_TASK.WILD_CROP')}
              onSelectAll={isMulti ? selectAllWildManagementPlans : undefined}
              onClearAll={isMulti ? clearAllWildManagementPlans : undefined}
            />
            <PureCropTileContainer gap={24} padding={0}>
              {wildCropTilesFilteredByInput.map((managementPlan) => {
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
          </div>
        )}
      </Form>
    </>
  );
};

export default PureTaskCrops;
