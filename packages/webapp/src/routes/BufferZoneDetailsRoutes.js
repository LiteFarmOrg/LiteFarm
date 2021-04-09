import { Route } from 'react-router-dom';
import React from 'react';
import EditBufferZoneDetailForm from '../containers/LocationDetails/LineDetails/BufferZoneDetailForm/EditBufferZone';
import LocationFieldCrop from '../containers/LocationDetails/LocationFieldCrop';

export default function BufferZoneDetailsRoutes() {
  return (
    <>
      <Route path="/buffer_zone/:location_id/details" exact component={EditBufferZoneDetailForm} />
      <Route path="/buffer_zone/:location_id/edit" exact component={EditBufferZoneDetailForm} />
      <Route path="/buffer_zone/:location_id/crops" exact component={LocationFieldCrop} />
    </>
  );
}
