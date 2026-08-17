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
import {
  parseGoogleGeocodedAddress,
  ParsedAddress,
} from '../../../util/google-maps/parseAddressComponents';
import { userFarmSelector } from '../../userFarmSlice';
import { UserFarm } from '../../../types';
import { isUpdatedTapeSchema } from './surveyConfig';

interface SurveyPrepopulatedData {
  location_province?: string;
  location_municipality?: string;
  country?: string;
  gps_lat?: number;
  gps_lon?: number;
  location1?: string;
  location2?: string;
  latitude?: number;
  longitude?: number;
}

const buildTapeLocationData = (
  surveyJson: Record<string, any>,
  parsedAddress: ParsedAddress,
  gridPoints: { lat: number; lng: number },
): SurveyPrepopulatedData => {
  if (isUpdatedTapeSchema(surveyJson)) {
    return {
      location1: parsedAddress.location_province,
      location2: parsedAddress.location_municipality,
      latitude: gridPoints.lat,
      longitude: gridPoints.lng,
    };
  }

  return {
    country: parsedAddress.country,
    location_province: parsedAddress.location_province,
    location_municipality: parsedAddress.location_municipality,
    gps_lat: gridPoints.lat,
    gps_lon: gridPoints.lng,
  };
};

/**
 * Returns pre-populated answers for a survey. Only the TAPE survey geocodes the farm address to
 * pre-fill location/GPS fields; other surveys start empty. Survey-specific pre-population is added
 * here per survey id. The question names differ between TAPE definitions, so the loaded
 * `surveyJson` decides which names are written
 */
export const useSurveyPrepopulatedData = (
  surveyId: string,
  surveyJson: Record<string, any> | undefined,
) => {
  const { isLoaded } = useGoogleMapsLoader(['geocoding']);

  // @ts-expect-error -- userFarmSelector issue
  const userFarm: UserFarm = useSelector(userFarmSelector);

  const [prepopulatedData, setPrepopulatedData] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (surveyId !== 'tape') {
      setIsLoading(false);
      return;
    }

    const fetchGeocodedData = async () => {
      if (!isLoaded || !surveyJson) {
        return;
      }

      if (!userFarm?.address) {
        setIsLoading(false);
        return;
      }

      try {
        const parsedAddress = await parseGoogleGeocodedAddress(userFarm.address);

        setPrepopulatedData(buildTapeLocationData(surveyJson, parsedAddress, userFarm.grid_points));
      } catch (error) {
        console.error('Failed to fetch geocoded data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGeocodedData();
  }, [surveyId, isLoaded, surveyJson, userFarm?.address, userFarm?.grid_points]);

  return { prepopulatedData, isLoading };
};
