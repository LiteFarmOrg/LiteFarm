/*
 *  Copyright 2026 LiteFarm.org
 *  This file is part of LiteFarm.
 *
 *  LiteFarm is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  LiteFarm is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details, see <https://www.gnu.org/licenses/>.
 */

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useGoogleMapsLoader } from '../../../hooks/useGoogleMapsLoader';
import { parseGoogleGeocodedAddress } from '../../../util/google-maps/parseAddressComponents';
import { userFarmSelector } from '../../userFarmSlice';
import { UserFarm } from '../../../types';

interface TapeSurveyPrepopulatedData {
  location_province?: string;
  location_municipality?: string;
  country?: string;
  gps_lat?: number;
  gps_lon?: number;
  // TODO LF-5109: Add other prepopulated fields:
  // - Do you raise animals
  // - Number of unique species in crop management plans
}

export const useTapeSurveyPrepopulatedData = () => {
  const { isLoaded } = useGoogleMapsLoader(['geocoding']);

  // @ts-expect-error -- userFarmSelector issue
  const userFarm: UserFarm = useSelector(userFarmSelector);

  const [prepopulatedData, setPrepopulatedData] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGeocodedData = async () => {
      if (!isLoaded) {
        return;
      }

      if (!userFarm?.address) {
        setIsLoading(false);
        return;
      }

      try {
        const parsedAddress = await parseGoogleGeocodedAddress(userFarm.address);

        const data: TapeSurveyPrepopulatedData = {
          country: parsedAddress.country,
          location_province: parsedAddress.location_province,
          location_municipality: parsedAddress.location_municipality,
          gps_lat: userFarm.grid_points.lat,
          gps_lon: userFarm.grid_points.lng,
        };

        setPrepopulatedData(data);
      } catch (error) {
        console.error('Failed to fetch geocoded data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGeocodedData();
  }, [isLoaded, userFarm?.address, userFarm?.grid_points]);

  return { prepopulatedData, isLoading };
};
