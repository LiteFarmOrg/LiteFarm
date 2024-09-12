import PropTypes from 'prop-types';
import clsx from 'clsx';
import Card from '../../Card';
import { useTranslation } from 'react-i18next';
import Square from '../../Square';
import styles from './styles.module.scss';

export default function CropStatusInfoBox({ status, ...props }) {
  const { t } = useTranslation();

  return (
    <Card color={'info'} className={clsx(styles.container)} {...props}>
      {status && (
        <div className={styles.secondRowContainer}>
          <div className={styles.cropCountContainer}>
            <Square>{status.active}</Square>
            {t('common:ACTIVE')}
          </div>
          <div className={styles.cropCountContainer}>
            <Square color={'planned'}>{status.planned}</Square>
            {t('common:PLANNED')}
          </div>
          <div className={styles.cropCountContainer}>
            <Square color={'past'}>{status.completed + status.abandoned}</Square>
            {t('common:PAST')}
          </div>
          <div className={styles.cropCountContainer}>
            <Square color={'needsPlan'}>{status.noPlans}</Square>
            {t('common:NEEDS_PLAN')}
          </div>
        </div>
      )}
    </Card>
  );
}

CropStatusInfoBox.propTypes = {
  status: PropTypes.exact({
    active: PropTypes.number,
    abandoned: PropTypes.number,
    planned: PropTypes.number,
    completed: PropTypes.number,
    noPlans: PropTypes.number,
  }),
};
