import PropTypes from 'prop-types';
import { Semibold } from '../Typography';
import styles from './styles.module.scss';
import clsx from 'clsx';

export default function RouterTab({ tabs, history, classes }) {
  const isSelected = (path) => history.location.pathname.includes(path);
  return (
    <div className={styles.container} style={classes?.container}>
      {tabs.map((tab) => (
        <Semibold
          className={clsx(styles.pill, isSelected(tab.path) && styles.selected)}
          onClick={() => history.push(tab.path)}
        >
          {tab.label}
        </Semibold>
      ))}
    </div>
  );
}

RouterTab.prototype = {
  tabs: PropTypes.shape({ label: PropTypes.string, path: PropTypes.string }),
  history: PropTypes.object,
  classes: PropTypes.object,
  currentPath: PropTypes.string,
};
