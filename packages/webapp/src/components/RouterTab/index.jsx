import PropTypes from 'prop-types';
import { Semibold } from '../Typography';
import styles from './styles.module.scss';
import clsx from 'clsx';

export default function RouterTab({ tabs, history, classes }) {
  const isSelected = (path) => history.location.pathname?.toLowerCase().includes(path);
  return (
    <div className={clsx(styles.container, styles.pill)} style={classes?.container}>
      {tabs.map((tab, index) => (
        <Semibold
          key={index}
          className={clsx(styles.pill, isSelected(tab.path) && styles.selected, styles.tab)}
          onClick={() => !isSelected(tab.path) && history.replace(tab.path, tab.state)}
          id={tab.label + index}
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
