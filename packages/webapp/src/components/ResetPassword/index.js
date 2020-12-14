import styles from './styles.scss';
import { ReactComponent as MailIconImg } from '../../assets/images/resetPassword/mail-icon.svg';
import Button from '../Form/Button';
import React from 'react';
import { useTranslation } from 'react-i18next';

export default function PureResetPassword({ sendLink }) {
  const { t } = useTranslation();
  const title = t('PASSWORD_RESET.TITLE');
  const descriptionTop = t('PASSWORD_RESET.DESCRIPTION_TOP');
  const descriptionBottom = t('PASSWORD_RESET.DESCRIPTION_BOTTOM');

  const buttonStyles = {
    font: 'Open Sans',
    fontSize: '16px',
    padding: '0.7em',
    borderRadius: '4px',
    alignItems: 'center',
    textAlign: 'center',
    letterSpacing: '0.4005px',
    color: '#66738A',
  };

  return (
    <div className={styles.container}>
      <div className={styles.imgContainer}>
        <MailIconImg />
      </div>
      <div className={styles.title}>{title}</div>
      <div className={styles.descriptionTop}>{descriptionTop}</div>
      <div className={styles.descriptionBottom}>{descriptionBottom}</div>
      <Button
        fullLength
        style={{ ...buttonStyles }}
        color="secondary"
        className={styles.bottomContainer}
        children={t('PASSWORD_RESET.BUTTON')}
        onClick={sendLink}
      />
    </div>
  );
}