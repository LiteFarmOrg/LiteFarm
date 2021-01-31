import { ReactComponent as Success } from '../../../assets/images/requestConfirmation/success.svg';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ModalComponent, Modal } from '../';

export function PureRequestConfirmationComponent({ onClick }) {
  const { t } = useTranslation();
  const title = t('REQUEST_CONFIRMATION_MODAL.TITLE');
  const description = t('REQUEST_CONFIRMATION_MODAL.DESCRIPTION');
  const buttonLabel = t('REQUEST_CONFIRMATION_MODAL.BUTTON');

  return (
    <ModalComponent
      onClick={onClick}
      title={title}
      descriptions={[description]}
      buttonLabel={buttonLabel}
      icon={<Success />}
    />
  );
}

export default function RequestConfirmationComponent({ onClick, dismissModal }) {
  return (
    <Modal dismissModal={dismissModal}>
      <PureRequestConfirmationComponent onClick={onClick} dismissModal={dismissModal} />
    </Modal>
  );
}
