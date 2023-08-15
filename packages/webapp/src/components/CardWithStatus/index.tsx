import React from 'react';
import styles from './styles.module.scss';
// @ts-ignore until migrated to TypeScript
import Card from '../Card';
// @ts-ignore until migrated to TypeScript
import { StatusLabel } from './StatusLabel';
// @ts-ignore until migrated to TypeScript
import Rating from '../Rating';
import { Happiness } from '../../../../domain/tasks/Happiness';

type CardStatus =
  | 'active'
  | 'planned'
  | 'completed'
  | 'late'
  | 'abandoned'
  | 'disabled'
  | 'forReview';

interface Props {
  status: CardStatus;
  label: string;
  style: React.CSSProperties;
  classes: { container?: React.CSSProperties; card?: React.CSSProperties };
  onClick?: React.MouseEventHandler<HTMLDivElement> | null;
  score: Happiness;
  color:
    | 'primary'
    | 'secondary'
    | 'active'
    | 'disabled'
    | 'taskCurrentActive'
    | 'taskMarkedActive'
    | 'completed'
    | 'forReview';
  children: React.ReactNode;
}

export function CardWithStatus({
  status,
  label,
  style,
  classes = {},
  onClick,
  score,
  color,
  children,
  ...props
}: Props) {
  return (
    <div className={styles.cardContainer} style={{ ...classes.container, ...style }}>
      <div className={styles.statusLabel}>
        <StatusLabel color={status} label={label} />
        {score && [0, 1, 2, 3, 4, 5].includes(score) && <Rating stars={score} viewOnly />}
      </div>
      <Card
        color={color}
        onClick={onClick}
        style={{
          cursor: onClick && color !== 'disabled' ? 'pointer' : 'default',
          ...classes.card,
        }}
        {...props}
      >
        {children}
      </Card>
    </div>
  );
}
