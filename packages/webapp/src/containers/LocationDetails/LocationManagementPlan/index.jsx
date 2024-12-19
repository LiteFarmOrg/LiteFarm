import { useState } from 'react';
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
import { useNavigate, useParams } from 'react-router-dom-v5-compat';

function LocationManagementPlan() {
  let navigate = useNavigate();
  const [filter, setFilter] = useState();
  const isAdmin = useSelector(isAdminSelector);
  const { location_id } = useParams();
  const activeCrops = useSelector(currentManagementPlansByLocationIdSelector(location_id));
  const pastCrops = useSelector(expiredManagementPlansByLocationIdSelector(location_id));
  const plannedCrops = useSelector(plannedManagementPlansByLocationIdSelector(location_id));
  const { t } = useTranslation();

  const onFilterChange = (e) => {
    setFilter(e.target.value.toLowerCase());
  };

  const onAddCrop = () => {
    navigate(`/crop_catalogue`);
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
        title={name}
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
