import { Route } from 'react-router-dom';
import React from 'react';
import EditGardenDetailForm from '../containers/LocationDetails/AreaDetails/GardenDetailForm/EditGarden';
import LocationFieldCrop from '../containers/LocationDetails/LocationFieldCrop';

export default function GardenDetailsRoutes() {
  return (
    <>
      <Route path="/garden/:location_id/details" exact component={EditGardenDetailForm} />
      <Route path="/garden/:location_id/edit" exact component={EditGardenDetailForm} />
      <Route path="/garden/:location_id/crops" exact component={LocationFieldCrop} />
    </>
  );
}
