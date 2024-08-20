import ModalComponent from '../ModalComponent/v2';
import { useTranslation } from 'react-i18next';

type FileSizeExceedModalProps = {
  dismissModal: () => void;
  handleRetry?: () => void;
  /**
   * File size in MB.
   */
  size?: number;
};

export default function FileSizeExceedModal({
  dismissModal,
  handleRetry,
  size = 10,
}: FileSizeExceedModalProps) {
  const { t } = useTranslation();
  return (
    <ModalComponent
      title={t(`FILE_SIZE_MODAL.TITLE`)}
      contents={[t('FILE_SIZE_MODAL.BODY', { size })]}
      dismissModal={dismissModal}
      error
    />
  );
}
