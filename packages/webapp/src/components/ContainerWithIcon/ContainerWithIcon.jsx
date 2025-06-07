import styles from './styles.module.scss';
import { colors } from '../../assets/theme';

export function ContainerWithIcon({
  children,
  style,
  icon,
  iconBackgroundColor = colors.teal700,
  onIconClick,
}) {
  return (
    <div className={styles.container} style={style}>
      <div
        style={{ backgroundColor: iconBackgroundColor }}
        onClick={onIconClick}
        className={styles.iconContainer}
      >
        {icon}
      </div>
      {children}
    </div>
  );
}
