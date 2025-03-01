import { ReactNode } from 'react';
import styles from './layout.module.scss';

export type BentoLayoutProps = {
  children: ReactNode;
  layoutConfig: {
    gapInPx: number;
    maxColumns: number;
  };
};

export default function BentoLayout({ children, layoutConfig }: BentoLayoutProps) {
  const { gapInPx, maxColumns } = layoutConfig;
  const style = { '--gap': `${gapInPx}px`, '--columns': maxColumns } as React.CSSProperties;

  return (
    <div className={styles.bento} style={style}>
      {children}
    </div>
  );
}
