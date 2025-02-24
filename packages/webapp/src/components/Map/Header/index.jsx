import PropTypes from 'prop-types';
import styles from './styles.module.scss';
import { useTranslation } from 'react-i18next';
import VideoLogo from '../../../assets/images/map/video.svg';
import { Cross } from '../../Icons';

export default function PureMapHeader({ farmName, showVideo, showClose, isAdmin }) {
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
      {isAdmin && showVideo && (
        <input type="image" src={VideoLogo} className={styles.button} onClick={showVideo} />
      )}
      {showClose && <Cross className={styles.cross} onClick={showClose} />}
    </div>
  );
}

PureMapHeader.propTypes = {
  style: PropTypes.object,
  farmName: PropTypes.string,
  showVideo: PropTypes.func,
  showClose: PropTypes.func,
};
