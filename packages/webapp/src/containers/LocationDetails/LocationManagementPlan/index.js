import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PureCropList from '../../../components/CropListPage';
import { isAdminSelector } from '../../userFarmSlice';
import { cropLocationByIdSelector } from '../../locationSlice';
import {
  currentManagementPlansByLocationIdSelector,
  expiredManagementPlansByLocationIdSelector,
  plannedManagementPlansByLocationIdSelector,
} from '../../Task/TaskCrops/managementPlansWithLocationSelector';
import { setEntryPath } from '../../hooks/useHookFormPersist/hookFormPersistSlice';

function LocationManagementPlan({ history, match }) {
  const dispatch = useDispatch();
  const [filter, setFilter] = useState();
  const isAdmin = useSelector(isAdminSelector);
  const { location_id } = match.params;
  const activeCrops = useSelector(currentManagementPlansByLocationIdSelector(location_id));
  const pastCrops = useSelector(expiredManagementPlansByLocationIdSelector(location_id));
  const plannedCrops = useSelector(plannedManagementPlansByLocationIdSelector(location_id));

  const onFilterChange = (e) => {
    setFilter(e.target.value.toLowerCase());
  };

  const onAddCrop = () => {
    dispatch(setEntryPath(`/field/${location_id}/crops`));
    history.push(`/crop/new`);
  };
  const location = useSelector(cropLocationByIdSelector(location_id));

  return (
    <>
      <PureCropList
        onFilterChange={onFilterChange}
        onAddCrop={onAddCrop}
        activeCrops={filteredManagementPlans(filter, activeCrops)}
        pastCrops={filteredManagementPlans(filter, pastCrops)}
        plannedCrops={filteredManagementPlans(filter, plannedCrops)}
        isAdmin={isAdmin}
        history={history}
        match={match}
        title={location.name}
      />
    </>
  );
}

const filteredManagementPlans = (filter, managementPlans) => {
  const filtered = filter
    ? managementPlans.filter(
        (managementPlan) =>
          managementPlan?.crop_variety?.toLowerCase()?.includes(filter) ||
          managementPlan?.crop_common_name?.toLowerCase()?.includes(filter),
      )
    : managementPlans;
  return filtered;
};

export default LocationManagementPlan;
