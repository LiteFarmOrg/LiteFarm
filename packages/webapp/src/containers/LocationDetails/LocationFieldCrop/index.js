import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import PureCropList from '../../../components/CropListPage';
import {
  currentFieldCropsByLocationIdSelector,
  expiredFieldCropsByLocationIdSelector,
  plannedFieldCropsByLocationIdSelector,
} from '../../fieldCropSlice';
import { isAdminSelector } from '../../userFarmSlice';
import { cropLocationByIdSelector } from '../../locationSlice';

function LocationFieldCrop({ history, match }) {
  const [filter, setFilter] = useState();
  const isAdmin = useSelector(isAdminSelector);
  const { location_id } = match.params;
  const activeCrops = useSelector(currentFieldCropsByLocationIdSelector(location_id));
  const pastCrops = useSelector(expiredFieldCropsByLocationIdSelector(location_id));
  const plannedCrops = useSelector(plannedFieldCropsByLocationIdSelector(location_id));

  const onFilterChange = (e) => {
    setFilter(e.target.value.toLowerCase());
  };

  const onAddCrop = () => {
    console.log('clicked adding crop');
  };
  const location = useSelector(cropLocationByIdSelector(location_id));

  return (
    <>
      <PureCropList
        onFilterChange={onFilterChange}
        onAddCrop={onAddCrop}
        activeCrops={filteredFieldCrops(filter, activeCrops)}
        pastCrops={filteredFieldCrops(filter, pastCrops)}
        plannedCrops={filteredFieldCrops(filter, plannedCrops)}
        isAdmin={isAdmin}
        history={history}
        match={match}
        title={location.name}
      />
    </>
  );
}

const filteredFieldCrops = (filter, fieldCrops) => {
  const filtered = filter
    ? fieldCrops.filter(
        (fieldCrop) =>
          fieldCrop?.crop_variety?.toLowerCase()?.includes(filter) ||
          fieldCrop?.crop_common_name?.toLowerCase()?.includes(filter),
      )
    : fieldCrops;
  return filtered;
};

export default LocationFieldCrop;
