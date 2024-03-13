import Cross from './cross';
import styles from './styles.module.scss';
import clsx from 'clsx';
import iconMap from './icons';

export { Cross };

export { iconMap };

const Icon = ({ iconName, circle = false, className = '', ...rest }) => {
  const Icon = iconMap[iconName];

  return (
    <div className={styles.displayBlock}>
      <div className={clsx(styles.icon, circle && styles.circle, className)}>
        <Icon {...rest} />
      </div>
    </div>
  );
};

export default Icon;
