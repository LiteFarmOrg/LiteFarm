import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import styles from './home.module.scss';

export default function PureHome({ first_name, farmName, date, children }) {
  const { t } = useTranslation();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.greeting}>
          {t('HOME.GREETING')}
          {first_name}
        </h1>
        <p className={styles.subtitle}>{`${farmName} - ${date}`}</p>
      </header>
      {children}
    </div>
  );
}

PureHome.propTypes = {
  first_name: PropTypes.string,
  farmName: PropTypes.string,
  date: PropTypes.string,
  children: PropTypes.node,
};
