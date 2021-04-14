import { Route } from 'react-router-dom';
import React from 'react';
import EditFieldDetailForm from '../containers/LocationDetails/AreaDetails/FieldDetailForm/EditField';
import LocationFieldCrop from '../containers/LocationDetails/LocationFieldCrop';
import { useSelector } from 'react-redux';
import { isAdminSelector } from '../containers/userFarmSlice';

export default function FieldDetailsRoutes() {
  const isAdmin = useSelector(isAdminSelector);
  return (
    <>
      <Route path="/field/:location_id/details" exact component={EditFieldDetailForm} />
      {isAdmin && <Route path="/field/:location_id/edit" exact component={EditFieldDetailForm} />}
      <Route path="/field/:location_id/crops" exact component={LocationFieldCrop} />
    </>
  );
}
