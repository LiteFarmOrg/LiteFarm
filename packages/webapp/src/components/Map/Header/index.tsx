import PropTypes from 'prop-types';
import styles from './styles.module.scss';
import { useTranslation } from 'react-i18next';
import Icon, { Cross } from '../../Icons';

type MapHeaderProps = {
  farmName: string;
  isAdmin?: boolean;
};

interface MapHeaderMain extends MapHeaderProps {
  handleVideoClick: () => void;
  handleClose?: never;
}

interface MapHeaderViewer extends MapHeaderProps {
  handleVideoClick?: never;
  handleClose: () => void;
}

export default function PureMapHeader({
  farmName,
  isAdmin,
  handleVideoClick,
  handleClose,
}: MapHeaderMain | MapHeaderViewer) {
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
      {isAdmin && handleVideoClick && (
        <Icon iconName="VIDEO_LOGO" onClick={handleVideoClick} className={styles.pointer} />
      )}
      {handleClose && <Cross className={styles.cross} onClick={handleClose} />}
    </div>
  );
}
