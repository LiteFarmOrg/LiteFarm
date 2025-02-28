import PropTypes from 'prop-types';
import styles from './styles.module.scss';
import { useTranslation } from 'react-i18next';
import Icon, { Cross } from '../../Icons';

export default function PureMapHeader({ farmName, handleVideoClick, handleClose, isAdmin }) {
  const { t } = useTranslation();

  return (
    <div className={styles.container}>
      <div className={styles.headerText}>
        <span className={styles.farmName}>
          {farmName.length > 77 ? `${farmName.substring(0, 77).trim()}...` : farmName}
        </span>
        {' | '}
        <span className={styles.farmMap}>{t('FARM_MAP.TITLE')}</span>
      </div>
      {isAdmin && handleVideoClick && <Icon iconName="VIDEO_LOGO" onClick={handleVideoClick} />}
      {handleClose && <Cross className={styles.cross} onClick={handleClose} />}
    </div>
  );
}

PureMapHeader.propTypes = {
  style: PropTypes.object,
  farmName: PropTypes.string,
  handleVideoClick: PropTypes.func,
  handleClose: PropTypes.func,
};
