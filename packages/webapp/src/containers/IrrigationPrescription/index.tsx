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

import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import styles from './styles.module.scss';
import { useGetIrrigationPrescriptionDetailsQuery } from '../../store/api/apiSlice';
import { locationByIdSelector } from '../locationSlice';
import { measurementSelector } from '../userFarmSlice';
import { DateInput, TimeInput } from '../../components/Inputs/DateTime';
import PureIrrigationPrescription from '../../components/IrrigationPrescription';
import FormNavigationButtons from '../../components/Form/FormNavigationButtons';
import FloatingContainer from '../../components/FloatingContainer';
import useApproveIrrigationPrescription from './useApproveIrrigationPrescription';
import IrrigationPrescriptionKPI from '../../components/IrrigationPrescriptionKPI';
import CardLayout from '../../components/Layout/CardLayout';
import PageTitle from '../../components/PageTitle/v2';
import Spinner from '../../components/Spinner';
import type { CustomRouteComponentProps } from '../../types';
import type { Location } from '../../types';
import { createSmartIrrigationDisplayName } from '../../util/smartIrrigation';

interface RouteParams {
  ip_pk: string;
}

interface IrrigationPrescriptionProps extends CustomRouteComponentProps<RouteParams> {
  isCompactSideMenu: boolean;
}

const dateTimeLabelStyles = {
  color: 'var(--Colors-Neutral-Neutral-500)',
  fontSize: '16px',
};

const IrrigationPrescription = ({
  match,
  history,
  isCompactSideMenu,
}: IrrigationPrescriptionProps) => {
  const { t } = useTranslation();

  const system = useSelector(measurementSelector);

  const { ip_pk } = match.params;

  const { data: irrigationPrescription, isLoading } = useGetIrrigationPrescriptionDetailsQuery(
    Number(ip_pk),
    {
      refetchOnMountOrArgChange: true,
    },
  );

  useEffect(() => {
    if (!isLoading && !irrigationPrescription) {
      history.replace('/unknown_record');
    }
  }, [isLoading, irrigationPrescription]);

  const onApprove = useApproveIrrigationPrescription(history, irrigationPrescription);

  const fieldLocation: Location | undefined = useSelector(
    locationByIdSelector(irrigationPrescription?.location_id ?? ''),
  );

  if (isLoading) {
    return (
      <div className={styles.spinnerWrapper}>
        <Spinner />
      </div>
    );
  }

  if (!irrigationPrescription?.prescription) {
    return null;
  }

  const { prescription, pivot, recommended_start_datetime } = irrigationPrescription;

  const { uriData, vriData } = prescription;

  return (
    <CardLayout className={styles.cardWrapper}>
      <div className={styles.irrigationPrescriptionContainer}>
        <PageTitle
          title={createSmartIrrigationDisplayName({
            label: t('IRRIGATION_PRESCRIPTION.TITLE'),
            system: irrigationPrescription.system,
          })}
          onGoBack={history.back}
          classNames={{ wrapper: styles.title }}
        ></PageTitle>
        <div className={styles.recommendedSchedule}>
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
        <IrrigationPrescriptionKPI
          irrigationPrescription={irrigationPrescription}
          system={system}
        />
        <PureIrrigationPrescription
          system={system}
          fieldLocation={fieldLocation}
          pivotCenter={pivot?.center}
          pivotRadiusInMeters={pivot?.radius}
          {...(uriData ? { uriData } : { vriData: vriData?.zones })}
        />
      </div>

      {onApprove && (
        <FloatingContainer isCompactSideMenu={isCompactSideMenu}>
          <FormNavigationButtons
            isFinalStep={true}
            isDisabled={false}
            informationalText={t('IRRIGATION_PRESCRIPTION.APPROVE_AND_CREATE_TASK')}
            onCancel={history.back}
            onContinue={onApprove}
            cancelButtonContent={
              <>
                <ChevronLeft />
                <span>{t('common:BACK')}</span>
              </>
            }
            saveButtonContent={
              <>
                <span>{t('common:APPROVE')}</span>
                <ChevronRight />
              </>
            }
          />
        </FloatingContainer>
      )}
    </CardLayout>
  );
};

export default IrrigationPrescription;
