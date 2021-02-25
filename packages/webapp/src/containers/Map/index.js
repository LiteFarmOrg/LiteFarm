import React, { useState, useEffect } from 'react';
import PureMap from '../../components/Map';
import { useSelector } from 'react-redux';
import { userFarmSelector } from '../../containers/userFarmSlice';

export default function Map() {
  const { farm_name, grid_points, is_admin } = useSelector(userFarmSelector);

  useEffect(() => {
    // setCenter(grid_points);
  }, []);

  const handleGoogleMapApi = (map, maps) => {
    console.log(map);
    console.log(maps);
  };

  return (
    <PureMap
      farmName={farm_name}
      handleGoogleMapApi={handleGoogleMapApi}
      isAdmin={is_admin}
      center={grid_points}
    />
  );
}
