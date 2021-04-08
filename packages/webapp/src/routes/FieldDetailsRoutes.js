import { Route } from 'react-router-dom';
import React from 'react';
import EditFieldDetailForm from '../containers/LocationDetails/AreaDetails/FieldDetailForm/EditField';
import LocationFieldCrop from '../containers/LocationDetails/LocationFieldCrop';

export default function FieldDetailsRoutes() {
  return (
    <>
      <Route path="/field/:location_id/details" exact component={EditFieldDetailForm} />
      <Route path="/field/:location_id/edit" exact component={EditFieldDetailForm} />
      <Route path="/field/:location_id/crops" exact component={LocationFieldCrop} />
    </>
  );
}
