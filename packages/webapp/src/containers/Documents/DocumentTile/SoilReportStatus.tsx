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

import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { ReactComponent as XCircle } from '../../../assets/images/x-circle.svg';
import { ReactComponent as CheckCircle } from '../../../assets/images/check-circle.svg';
import styles from './styles.module.scss';

enum ReportStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

interface SoilReportStatusProps {
  status: ReportStatus;
}

export const getSoilReportStatus = (reports: { status: ReportStatus }[]) => {
  if (reports[0]?.status === ReportStatus.COMPLETED || reports[0]?.status === ReportStatus.FAILED) {
    return reports[0].status;
  }

  // TODO: confirm
  return null;
};

const icons = {
  [ReportStatus.FAILED]: <XCircle />,
  [ReportStatus.COMPLETED]: <CheckCircle />,
};

export default function SoilReportStatus({ status }: SoilReportStatusProps) {
  const { t } = useTranslation();

  if (!status) {
    return null;
  }

  if (status !== ReportStatus.FAILED && status !== ReportStatus.COMPLETED) {
    // TODO: confirm
    return null;
  }

  return (
    <div className={clsx(styles.soilReportStatus, styles[status.toLowerCase()])}>
      {icons[status]}
      <span>
        {status === ReportStatus.COMPLETED
          ? t('common:DATA_UPLOADED')
          : t('common:DATA_NOT_UPLOADED')}
      </span>
    </div>
  );
}
