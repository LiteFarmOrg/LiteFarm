import Cross from './cross';
import styles from './styles.module.scss';
import clsx from 'clsx';

export { Cross };

const IconInCircle = (Icon, className, props) => {
  return (
    <div className={styles.block}>
      <div className={clsx(className, styles.circle)}>
        <Icon {...props} />
      </div>
    </div>
  );
};

const IconInSquare = (Icon, className, props) => {
  return (
    <div className={styles.block}>
      <div className={clsx(className, styles.square)}>
        <Icon {...props} />
      </div>
    </div>
  );
};

export const FramedIcon = ({ icon, kind, className, ...rest }) => {
  switch (kind) {
    case 'circle':
      return IconInCircle(icon, className, rest);
    case 'square':
      return IconInSquare(icon, className, rest);
    default:
      return null;
  }
};
