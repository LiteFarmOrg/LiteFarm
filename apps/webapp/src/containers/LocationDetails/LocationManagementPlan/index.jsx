import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import PureCropList from '../../../components/CropListPage';
import { isAdminSelector } from '../../userFarmSlice';
import { cropLocationByIdSelector } from '../../locationSlice';
import {
  currentManagementPlansByLocationIdSelector,
  expiredManagementPlansByLocationIdSelector,
  plannedManagementPlansByLocationIdSelector,
} from '../../Task/TaskCrops/managementPlansWithLocationSelector';
import { useTranslation } from 'react-i18next';

function LocationManagementPlan({ history, match, location }) {
  const [filter, setFilter] = useState();
  const isAdmin = useSelector(isAdminSelector);
  const { location_id } = match.params;
  const activeCrops = useSelector(currentManagementPlansByLocationIdSelector(location_id));
  const pastCrops = useSelector(expiredManagementPlansByLocationIdSelector(location_id));
  const plannedCrops = useSelector(plannedManagementPlansByLocationIdSelector(location_id));
  const { t } = useTranslation();

  const onFilterChange = (e) => {
    setFilter(e.target.value.toLowerCase());
  };

  const onAddCrop = () => {
    history.push(`/crop_catalogue`);
  };
  const { name } = useSelector(cropLocationByIdSelector(location_id));

  return (
    <>
      <PureCropList
        onFilterChange={onFilterChange}
        onAddCrop={onAddCrop}
        activeCrops={filteredManagementPlans(filter, activeCrops, t)}
        pastCrops={filteredManagementPlans(filter, pastCrops, t)}
        plannedCrops={filteredManagementPlans(filter, plannedCrops, t)}
        isAdmin={isAdmin}
        history={history}
        match={match}
        title={name}
        location={location}
      />
    </>
  );
}

const check = (name, filter) => {
  return (
    name?.toLowerCase().includes(filter) ||
    name
      ?.toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .includes(filter)
  );
};

const filteredManagementPlans = (filter, managementPlans, t) => {
  return filter
    ? managementPlans.filter(
        (managementPlan) =>
          check(managementPlan?.crop_variety?.crop_variety_name, filter) ||
          check(t(`crop:${managementPlan?.crop_variety?.crop_translation_key}`), filter),
      )
    : managementPlans;
};

export default LocationManagementPlan;
