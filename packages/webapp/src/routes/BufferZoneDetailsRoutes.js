import { Route } from 'react-router-dom';
import React from 'react';
import EditBufferZoneDetailForm from '../containers/LocationDetails/LineDetails/BufferZoneDetailForm/EditBufferZone';
import LocationManagementPlan from '../containers/LocationDetails/LocationManagementPlan';
import { useSelector } from 'react-redux';
import { isAdminSelector } from '../containers/userFarmSlice';

export default function BufferZoneDetailsRoutes() {
  const isAdmin = useSelector(isAdminSelector);
  return (
    <>
      <Route path="/buffer_zone/:location_id/details" exact component={EditBufferZoneDetailForm} />
      {isAdmin && (
        <Route path="/buffer_zone/:location_id/edit" exact component={EditBufferZoneDetailForm} />
      )}
      <Route path="/buffer_zone/:location_id/crops" exact component={LocationManagementPlan} />
    </>
  );
}
