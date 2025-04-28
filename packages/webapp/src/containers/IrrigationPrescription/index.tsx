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
import clsx from 'clsx';
import { useTheme } from '@mui/styles';
import { useMediaQuery } from '@mui/material';
import { useSectionHeader } from '../../components/Navigation/useSectionHeaders';
import styles from './styles.module.scss';
import { locationByIdSelector } from '../locationSlice';
import { measurementSelector } from '../userFarmSlice';
import { Main } from '../../components/Typography';
import { DateInput, TimeInput } from '../../components/Inputs/DateTime';
import PureIrrigationPrescription from '../../components/IrrigationPrescription';
import type { CustomRouteComponentProps } from '../../types';
import PageTitle from '../../components/PageTitle/v2';
import Layout from '../../components/Layout';
import layoutStyles from '../../components/Layout/layout.module.scss';
import { Location } from '../../types';
import type { IrrigationPrescription } from '../../components/IrrigationPrescription/types';
import {
  mockField,
  mockUriData,
  mockVriZones,
  mockPivot,
} from '../../stories/IrrigationPrescription/mockData';

interface RouteParams {
  ip_pk: string;
}

interface IrrigationPrescriptionProps extends CustomRouteComponentProps<RouteParams> {}

const dateTimeLabelStyles = {
  color: 'var(--Colors-Neutral-Neutral-500)',
  fontSize: '16px',
};

const IrrigationPrescription = ({ match, history }: IrrigationPrescriptionProps) => {
  const { t } = useTranslation();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const pageTitle = useSectionHeader(history.location.pathname);

  const system = useSelector(measurementSelector);

  const { ip_pk } = match.params;

  /*--------------------------------------
  
  TODO LF-4788: Call the backend here to get the actual data for the given uuid 
  
  Also handle case of no matching uuid (unknown record) */

  const commonMockData = {
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
          ...commonMockData,
          id: 1,
          prescription: {
            uriData: mockUriData,
          },
        }
      : {
          ...commonMockData,
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

  /* ------------------------------------- */

  const { prescription, pivot, recommended_start_datetime } = irrigationPrescription;

  const { uriData, vriData } = prescription;

  return (
    <div className={clsx(styles.irrigationPrescriptionContainer, layoutStyles.paperContainer)}>
      {isMobile && pageTitle}
      <div className={clsx(styles.recommendedSchedule)}>
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
  );
};

export default IrrigationPrescription;
