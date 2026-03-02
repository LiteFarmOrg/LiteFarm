import PropTypes from 'prop-types';
import styles from './styles.module.scss';
import { useTranslation } from 'react-i18next';
import { Cross } from '../../Icons';

type MapHeaderProps = {
  farmName: string;
};

interface MapHeaderMain extends MapHeaderProps {
  handleClose?: never;
}

interface MapHeaderViewer extends MapHeaderProps {
  handleClose: () => void;
}

export default function PureMapHeader({ farmName, handleClose }: MapHeaderMain | MapHeaderViewer) {
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
      {handleClose && <Cross className={styles.cross} onClick={handleClose} />}
    </div>
  );
}
