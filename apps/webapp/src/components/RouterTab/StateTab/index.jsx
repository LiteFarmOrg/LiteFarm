import PropTypes from 'prop-types';
import { Semibold } from '../../Typography';
import styles from '../styles.module.scss';
import clsx from 'clsx';

export default function StateTab({ tabs, state, setState, classes }) {
  const isSelected = (key) => state === key;
  return (
    <div className={styles.container} style={classes?.container}>
      {tabs.map((tab, index) => (
        <Semibold
          key={index}
          className={clsx(styles.pill, isSelected(tab.key) && styles.selected)}
          onClick={() => !isSelected(tab.key) && setState(tab.key)}
          id={tab.label + index}
        >
          {tab.label}
        </Semibold>
      ))}
    </div>
  );
}

StateTab.prototype = {
  tabs: PropTypes.shape({ label: PropTypes.string, key: PropTypes.string }),
  state: PropTypes.string,
  setState: PropTypes.func,
  classes: PropTypes.object,
  currentPath: PropTypes.string,
};
