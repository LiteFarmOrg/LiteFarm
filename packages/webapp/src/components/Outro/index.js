import styles from './styles.scss';
import OutroImg from '../../assets/images/outro/outro.svg';
import Footer from '../Footer';
import Button from '../Form/Button';
import React from 'react';
import { useTranslation } from "react-i18next";

import { Title } from '../Typography';

export default function PureOutroSplash({ onContinue, onGoBack }) {
  const { t } = useTranslation();

  return (
    <>
      <div className={styles.home}>
        <div className={styles.lander}>
          <div className={styles.greetContainer}>
            <img src={OutroImg}/>
            <div className={styles.description}>
              <Title>{t('OUTRO')}</Title>
            </div>
          </div>
        </div>

      </div>
      <Footer style={{ position: 'sticky', bottom: '0' }}
              children={<><Button fullLength color="secondary" onClick={onGoBack}>{t('common:BACK')}</Button>

                <Button fullLength onClick={onContinue}/>{t('common:FINISH')}</Button>
              </>}
      >
      </Footer>
    </>
  )
}
