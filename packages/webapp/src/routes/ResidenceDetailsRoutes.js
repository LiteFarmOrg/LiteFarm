import { Route } from 'react-router-dom';
import React from 'react';
import EditResidenceDetailForm from '../containers/LocationDetails/AreaDetails/ResidenceDetailForm/EditResidence';
import { useSelector } from 'react-redux';
import { isAdminSelector } from '../containers/userFarmSlice';

export default function ResidenceDetailsRoutes() {
  const isAdmin = useSelector(isAdminSelector);
  return (
    <>
      <Route path="/residence/:location_id/details" exact component={EditResidenceDetailForm} />
      {isAdmin && (
        <Route path="/residence/:location_id/edit" exact component={EditResidenceDetailForm} />
      )}
    </>
  );
}
