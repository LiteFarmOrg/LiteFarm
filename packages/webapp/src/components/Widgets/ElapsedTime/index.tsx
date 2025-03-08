import { getDurationString, getTimeDifferrenceInSeconds } from '../../../util/date-migrate-TS';
import Icon from '../../Icons';
import styles from './styles.module.scss';

type ElapsedTimeWidgetProps = {
  pastDate: Date;
};

export default function ElapsedTimeWidget({ pastDate }: ElapsedTimeWidgetProps) {
  const timeInS = getTimeDifferrenceInSeconds(pastDate, new Date());
  const durationString = getDurationString(timeInS);
  return (
    <div className={styles.container}>
      <div className={styles.duration}>{durationString}</div>
      <Icon iconName="CLOCK_FAST" className={styles.icon} />
    </div>
  );
}
