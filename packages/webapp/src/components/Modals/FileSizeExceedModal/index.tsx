import ModalComponent from '../ModalComponent/v2';
import { useTranslation } from 'react-i18next';

type FileSizeExceedModalProps = {
  dismissModal: () => void;
  handleRetry?: () => void;
};

export default function FileSizeExceedModal({
  dismissModal,
  handleRetry,
}: FileSizeExceedModalProps) {
  const { t } = useTranslation();
  return (
    <ModalComponent
      title={t(`FILE_SIZE_MODAL.TITLE`)}
      contents={[t('FILE_SIZE_MODAL.BODY')]}
      dismissModal={dismissModal}
      error
    />
  );
}
