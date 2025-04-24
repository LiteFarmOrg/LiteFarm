/*
 *  Copyright 2025 LiteFarm.org
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

import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import styles from './styles.module.scss';
import { locationByIdSelector } from '../locationSlice';
import { measurementSelector } from '../userFarmSlice';
import { Main } from '../../components/Typography';
import { DateInput, TimeInput } from '../../components/Inputs/DateTime';
import PureIrrigationPrescription from '../../components/IrrigationPrescription';
import type { CustomRouteComponentProps } from '../../types';
import { Location } from '../../types';
import {
  mockField,
  mockUriData,
  mockVriZones,
  mockPivot,
} from '../../stories/IrrigationPrescription/mockData';
import PageTitle from '../../components/PageTitle/v2';
import Layout from '../../components/Layout';
import layoutStyles from '../../components/Layout/layout.module.scss';

interface RouteParams {
  ip_pk: string;
}

interface IrrigationPrescriptionProps extends CustomRouteComponentProps<RouteParams> {}

const dateTimeLabelStyles = {
  color: 'var(--Colors-Neutral-Neutral-500)',
  fontSize: '16px',
};

/* ------------------------------ */

export interface UriPrescriptionData {
  soil_moisture_deficit: number;
  application_depth: number;
  application_depth_unit: string;
}

export type VriPrescriptionData = UriPrescriptionData & {
  grid_points: { lat: number; lng: number }[];
};

export type IrrigationPrescription = {
  id: number;

  location_id: string;
  recommended_start_datetime: string; // ISO string

  pivot: {
    center: { lat: number; lng: number };
    radius: number; // in meters
  };

  metadata: {
    // metadata = external sources of information used to generate the irrigation prescription
    weather_forecast?: {
      temperature: number;
      temperature_unit: string;
      wind_speed: number;
      wind_speed_unit: string;
      cumulative_rainfall: number;
      cumultative_rainfall_unit: string;
      et_rate: number;
      et_rate_unit: string;
      weather_icon_code: string; // '02d', '50n', OpenWeatherMap icon code if available
    };
  };

  estimated_time: number;
  estimated_time_unit: string;

  // TODO: confirm with product if we are indeed getting only URI or VRI data per prescription
  prescription:
    | { uriData: UriPrescriptionData; vriData?: never }
    | {
        vriData: {
          zones: VriPrescriptionData[];
          file_url: string;
        };
        uriData?: never;
      };
};
/* ------------------------------ */

const IrrigationPrescription = ({ match }: IrrigationPrescriptionProps) => {
  const { t } = useTranslation();

  const system = useSelector(measurementSelector);

  const { ip_pk } = match.params;

  /*--------------------------------------
  
  TODO LF-4788: Call the backend here to get the actual data for the given uuid 
  
  Also handle case of no matching uuid (unknown record)

  --------------------------------------*/

  const commonProps = {
    location_id: mockField.location_id,
    recommended_start_datetime: new Date().toISOString(),
    pivot: mockPivot,
    metadata: {
      weather_forecast: {
        temperature: 20,
        temperature_unit: 'c',
        wind_speed: 10,
        wind_speed_unit: 'km/h',
        cumulative_rainfall: 5,
        cumultative_rainfall_unit: 'mm',
        et_rate: 2,
        et_rate_unit: 'mm/h',
        weather_icon_code: '02d',
      },
    },
    estimated_time: 2,
    estimated_time_unit: 'h',
    estimated_water_consumption: 100,
    estimated_water_consumption_unit: 'l',
  };

  const irrigationPrescription: IrrigationPrescription =
    ip_pk === 'uri_pk'
      ? {
          ...commonProps,
          id: 1,
          prescription: {
            uriData: mockUriData,
          },
        }
      : {
          ...commonProps,
          id: 2,
          prescription: {
            vriData: {
              zones: mockVriZones,
              file_url: 'https://example.com/vri_data.json',
            },
          },
        };

  const fieldLocation: Location | undefined =
    useSelector(locationByIdSelector(irrigationPrescription?.location_id ?? '')) || mockField;

  const { prescription, pivot, recommended_start_datetime } = irrigationPrescription;

  const { uriData, vriData } = prescription;

  /* ------------------------------------- */
  return (
    <Layout className={layoutStyles.paperContainer}>
      <PageTitle title={t('IRRIGATION_PRESCRIPTION.TITLE')} onGoBack={() => history.back()} />
      <div className={styles.irrigationPrescriptionContainer}>
        <div className={styles.recommendedSchedule}>
          <Main>{t('IRRIGATION_PRESCRIPTION.RECOMMENDED_SCHEDULE')}</Main>
          <DateInput
            date={recommended_start_datetime}
            label={t('IRRIGATION_PRESCRIPTION.START_DATE')}
            disabled
            labelStyles={dateTimeLabelStyles}
          />
          <TimeInput
            date={recommended_start_datetime}
            label={t('IRRIGATION_PRESCRIPTION.START_TIME')}
            disabled
            labelStyles={dateTimeLabelStyles}
          />
        </div>
        <PureIrrigationPrescription
          system={system}
          fieldLocation={fieldLocation}
          pivotCenter={pivot.center}
          pivotRadiusInMeters={pivot.radius}
          {...(uriData ? { uriData } : { vriData: vriData?.zones })}
        />
      </div>
    </Layout>
  );
};

export default IrrigationPrescription;
