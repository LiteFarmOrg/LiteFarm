import React, { useState }  from 'react';
// import { postWatercourseLocation } from './saga';
import { useDispatch, useSelector } from 'react-redux';
// import { measurementSelector } from '../../userFarmSlice';
// import { locationInfoSelector } from '../../mapSlice';
// import useHookFormPersist from '../../hooks/useHookFormPersist';
import PureCropList from '../../components/CropListPage';
import NewFieldCropModal from '../../components/Forms/NewFieldCropModal';
import {
  currentFieldCropsByLocationIdSelector,
  expiredFieldCropsByLocationIdSelector,
  plannedFieldCropsByLocationIdSelector,
} from '../fieldCropSlice';
import { isAdminSelector } from '../userFarmSlice';

function Testing({ history }) {
  const [filter, setFilter] = useState();
  const isAdmin = useSelector(isAdminSelector);
  const location_id = "53843c3e-9189-11eb-9af2-9801a7b52f9d";
  const activeCrops = useSelector(currentFieldCropsByLocationIdSelector(location_id));
  const pastCrops = useSelector(expiredFieldCropsByLocationIdSelector(location_id));
  const plannedCrops = useSelector(plannedFieldCropsByLocationIdSelector(location_id));

  const onFilterChange = (e) => {
    setFilter(e.target.value.toLowerCase());
  };

  const onAddCrop = () => {
    console.log("clicked adding crop");
  };

  return (
    <>
    {isAdmin && (
      <NewFieldCropModal
        handler={() => {}}
        // field={this.state.selectedField}
        // fieldArea={this.state.fieldArea}
      />
    )}
    <PureCropList
      onFilterChange={onFilterChange}
      onAddCrop={onAddCrop}
      activeCrops={filteredFieldCrops(filter, activeCrops)}
      pastCrops={filteredFieldCrops(filter, pastCrops)}
      plannedCrops={filteredFieldCrops(filter, plannedCrops)}
      isAdmin={isAdmin}
    />
    </>
  );
}

const filteredFieldCrops = (filter, fieldCrops) => {
  const filtered = filter ?
    fieldCrops.filter((fieldCrop) => (
      fieldCrop.variety.toLowerCase().includes(filter) ||
      fieldCrop.crop_common_name.toLowerCase().includes(filter)
    )) :
    fieldCrops;
  return filtered;
}

export default Testing;
