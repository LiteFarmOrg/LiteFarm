import { Route } from 'react-router-dom';
import React from 'react';
import EditGateDetailForm from '../containers/LocationDetails/PointDetails/GateDetailForm/EditGate';
import { useSelector } from 'react-redux';
import { isAdminSelector } from '../containers/userFarmSlice';

export default function GateDetailsRoutes() {
  const isAdmin = useSelector(isAdminSelector);
  return (
    <>
      <Route path="/gate/:location_id/details" exact component={EditGateDetailForm} />
      {isAdmin && <Route path="/gate/:location_id/edit" exact component={EditGateDetailForm} />}
    </>
  );
}
