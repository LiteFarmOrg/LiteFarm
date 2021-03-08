import { ReactComponent as MailIconImg } from '../../../assets/images/resetPassword/mail-icon.svg';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ModalComponent, Modal } from '../';

export function PureResetPasswordComponent({ onClick, changeText }) {
  const { t } = useTranslation();
  const title = t('PASSWORD_RESET.TITLE');
  const descriptionTop = t('PASSWORD_RESET.DESCRIPTION_TOP');
  const descriptionBottom = t('PASSWORD_RESET.DESCRIPTION_BOTTOM');
  const buttonLabel = changeText ? t('PASSWORD_RESET.BUTTON_SENDING') : t('PASSWORD_RESET.BUTTON');
  return (
    <ModalComponent
      buttonColor={'secondary'}
      onClick={onClick}
      title={title}
      descriptions={[descriptionTop, descriptionBottom]}
      buttonLabel={buttonLabel}
      disabled={changeText}
      icon={<MailIconImg />}
    />
  );
}

export default function ResetPasswordModal({ onClick, dismissModal, changeText }) {
  return (
    <Modal dismissModal={dismissModal}>
      <PureResetPasswordComponent onClick={onClick} changeText={changeText} />
    </Modal>
  );
}
