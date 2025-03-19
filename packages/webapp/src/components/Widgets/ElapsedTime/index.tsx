import { useEffect, useState } from 'react';
import TimeAgo from 'react-timeago';
import buildFormatter from 'react-timeago/lib/formatters/buildFormatter';
import { enFuzzyShort } from './en-fuzzy.short';
import { getDurationString, getTimeDifferrenceInSeconds } from '../../../util/date-migrate-TS';
import Icon from '../../Icons';
import styles from './styles.module.scss';

type ElapsedTimeWidgetProps = {
  pastDate: Date;
};

const formatter = buildFormatter(enFuzzyShort);

export default function ElapsedTimeWidget({ pastDate }: ElapsedTimeWidgetProps) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 60000); // update every minute

    return () => clearInterval(timer);
  }, []);

  const timeInS = getTimeDifferrenceInSeconds(pastDate, now);
  const durationString = getDurationString(timeInS);
  return (
    <div className={styles.container}>
      <div className={styles.duration}>{durationString}</div>
      <Icon iconName="CLOCK_FAST" className={styles.icon} />
    </div>
  );
}

export function ElapsedTimeWidgetReactTimeAgo({ pastDate }: ElapsedTimeWidgetProps) {
  return (
    <div className={styles.container}>
      <TimeAgo date={pastDate} formatter={formatter} minPeriod={60} />
      <Icon iconName="CLOCK_FAST" className={styles.icon} />
    </div>
  );
}
