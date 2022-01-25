import styles from './styles.module.scss';

export function CardWithStatusContainer({ children, ...props }) {
  return (
    <div className={styles.container} {...props}>
      {children}
    </div>
  );
}
