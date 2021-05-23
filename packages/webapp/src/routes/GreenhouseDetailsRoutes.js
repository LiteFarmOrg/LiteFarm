import { Route } from 'react-router-dom';
import React from 'react';
import EditGreenhouseDetailForm from '../containers/LocationDetails/AreaDetails/GreenhouseDetailForm/EditGreenhouse';
import LocationFieldCrop from '../containers/LocationDetails/LocationFieldCrop';
import { useSelector } from 'react-redux';
import { isAdminSelector } from '../containers/userFarmSlice';

export default function GreenhouseDetailsRoutes() {
  const isAdmin = useSelector(isAdminSelector);
  return (
    <>
      <Route path="/greenhouse/:location_id/details" exact component={EditGreenhouseDetailForm} />
      {isAdmin && (
        <Route path="/greenhouse/:location_id/edit" exact component={EditGreenhouseDetailForm} />
      )}
      <Route path="/greenhouse/:location_id/crops" exact component={LocationFieldCrop} />
    </>
  );
}
