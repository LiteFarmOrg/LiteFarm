/*
 *  Copyright 2026 LiteFarm.org
 *  This file is part of LiteFarm.
 *
 *  LiteFarm is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  LiteFarm is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details, see <https://www.gnu.org/licenses/>.
 */

import { ChangeEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import PureFilePickerWrapper from '../Form/FilePickerWrapper';
import TextButton from '../Form/Button/TextButton';
import FileSizeExceedModal from '../Modals/FileSizeExceedModal';
import { ReactComponent as PhotoLibraryIcon } from '../../assets/images/imageCapture/photo-btn.svg';
import { ReactComponent as CameraIcon } from '../../assets/images/imageCapture/camera-btn.svg';
import { ReactComponent as TrashIcon } from '../../assets/images/imageCapture/trash-03.svg';
import { ReactComponent as EditIcon } from '../../assets/images/imageCapture/edit-02.svg';
import useHasCamera from './useHasCamera';
import styles from './styles.module.scss';

export type ImageUploadCaptureProps = {
  onSelectImage: (file: File) => void;
  onRemoveImage: () => void;
  selectedImageUrl?: string;
};

export default function ImageUploadCapture({
  onSelectImage,
  onRemoveImage,
  selectedImageUrl,
}: ImageUploadCaptureProps) {
  const { t } = useTranslation();
  const hasCamera = useHasCamera();
  const showTakePhoto = hasCamera || navigator.maxTouchPoints > 1;

  const [previewUrl, setPreviewUrl] = useState(selectedImageUrl ?? '');
  const [showFileSizeExceedsModal, setShowFileSizeExceedsModal] = useState(false);

  useEffect(() => {
    setPreviewUrl(selectedImageUrl ?? '');
  }, [selectedImageUrl]);

  useEffect(() => {
    return () => {
      if (previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFile = (file: File) => {
    if (file.size > 5e6) {
      setShowFileSizeExceedsModal(true);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    onSelectImage(file);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) {
      return;
    }
    handleFile(e.target.files[0]);
    e.target.value = '';
  };

  const handleRemove = () => {
    setPreviewUrl('');
    onRemoveImage();
  };

  return (
    <>
      {showFileSizeExceedsModal && (
        <FileSizeExceedModal size={5} dismissModal={() => setShowFileSizeExceedsModal(false)} />
      )}

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionLabel}>{t('FARM_NOTE.ATTACH_PHOTO')}</span>
          <span className={styles.optional}>{t('common:OPTIONAL')}</span>
        </div>

        <div className={clsx(styles.body, previewUrl && styles.bodyWithPreview)}>
          {previewUrl ? (
            <>
              <img className={styles.preview} src={previewUrl} alt="" />
              <div className={styles.previewActions}>
                <PureFilePickerWrapper accept="image/*" onChange={handleChange} fullWidth>
                  <TextButton type="button" className={styles.actionBtn}>
                    <EditIcon />
                    {t('UPLOADER.CHANGE_IMAGE')}
                  </TextButton>
                </PureFilePickerWrapper>
                <TextButton type="button" className={styles.actionBtn} onClick={handleRemove}>
                  <TrashIcon />
                  {t('UPLOADER.REMOVE_IMAGE')}
                </TextButton>
              </div>
            </>
          ) : (
            <>
              <div className={styles.photoBtn}>
                <PureFilePickerWrapper accept="image/*" onChange={handleChange}>
                  <div className={styles.photoBtnIcon}>
                    <PhotoLibraryIcon />
                  </div>
                </PureFilePickerWrapper>
                <span className={styles.photoBtnLabel}>{t('FARM_NOTE.PHOTO_LIBRARY')}</span>
              </div>

              {showTakePhoto && (
                <div className={styles.photoBtn}>
                  <PureFilePickerWrapper
                    accept="image/*"
                    capture="environment"
                    onChange={handleChange}
                  >
                    <div className={styles.photoBtnIcon}>
                      <CameraIcon />
                    </div>
                  </PureFilePickerWrapper>
                  <span className={styles.photoBtnLabel}>{t('FARM_NOTE.TAKE_PHOTO')}</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
