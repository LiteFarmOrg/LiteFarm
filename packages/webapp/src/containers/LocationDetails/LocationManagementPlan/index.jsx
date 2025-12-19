import { useState } from 'react';
import { useRouteMatch, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import PureCropList from '../../../components/CropListPage';
import { isAdminSelector } from '../../userFarmSlice';
import { cropLocationByIdSelector } from '../../locationSlice';
import { useTranslation } from 'react-i18next';
import useLocationCrops from './useLocationCrops';
import useLocationRouterTabs from '../useLocationRouterTabs';

function LocationManagementPlan() {
  const navigate = useNavigate();
  const match = useRouteMatch();
  const [filter, setFilter] = useState();
  const isAdmin = useSelector(isAdminSelector);
  const { location_id } = match.params;
  const location = useSelector(cropLocationByIdSelector(location_id));
  const { activeCrops, pastCrops, plannedCrops } = useLocationCrops(location_id);
  const routerTabs = useLocationRouterTabs(location);
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
        match={match}
        title={name}
        location={location}
        routerTabs={routerTabs}
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
