import { ReactComponent as Success } from '../../../assets/images/resetPassword/success.svg';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ModalComponent, Modal } from '../';

export function PureResetSuccessComponent({ onClick }) {
  const { t } = useTranslation();
  const title = t('PASSWORD_RESET_SUCCESS_MODAL.TITLE');
  const descriptionTop = t('PASSWORD_RESET_SUCCESS_MODAL.DESCRIPTION');
  const buttonLabel = t('PASSWORD_RESET_SUCCESS_MODAL.BUTTON');

  return (
    <ModalComponent
      onClick={onClick}
      title={title}
      descriptions={[descriptionTop]}
      buttonLabel={buttonLabel}
      icon={<Success />}
    />
  );
}

export default function ResetSuccessModal({ onClick, dismissModal }) {
  return (
    <Modal dismissModal={dismissModal}>
      <PureResetSuccessComponent onClick={onClick} />
    </Modal>
  );
}
