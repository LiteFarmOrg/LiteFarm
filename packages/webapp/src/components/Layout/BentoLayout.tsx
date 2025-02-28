import { ReactNode } from 'react';
import styles from './layout.module.scss';

type BentoLayout = {
  children: ReactNode;
};

export default function BentoLayout({ children }: BentoLayout) {
  return <div className={styles.bento}>{children}</div>;
}
