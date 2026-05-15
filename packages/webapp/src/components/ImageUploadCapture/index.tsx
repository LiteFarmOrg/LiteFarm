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

import { ChangeEvent, DragEvent, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import clsx from 'clsx';
import PureFilePickerWrapper from '../Form/FilePickerWrapper';
import TextButton from '../Form/Button/TextButton';
import InputBaseLabel from '../Form/InputBase/InputBaseLabel';
import FileSizeExceedModal from '../Modals/FileSizeExceedModal';
import PhotoLibraryIcon from '../../assets/images/imageCapture/photo-btn.svg?react';
import CameraIcon from '../../assets/images/imageCapture/camera-btn.svg?react';
import TrashIcon from '../../assets/images/trash-03.svg?react';
import EditIcon from '../../assets/images/edit-02.svg?react';
import { enqueueErrorSnackbar } from '../../containers/Snackbar/snackbarSlice';
import getDeviceType from '../../util/getDeviceType';
import { isImageFile } from '../../util/validation';
import styles from './styles.module.scss';

const COMPRESSION_THRESHOLD = 5e6; // 5MB
const MAX_ACCEPTED_FILE_SIZE = 50e6; // 50MB for orignal file, matching high MP images from most phones

const compressImage = async (file: File): Promise<Blob> => {
  const Compressor = await import('compressorjs').then((compressor) => compressor.default);
  return new Promise((resolve, reject) => {
    new Compressor(file, {
      quality: 0.8,
      maxWidth: 2560,
      maxHeight: 2560,
      checkOrientation: false,
      success: resolve,
      error: reject,
    });
  });
};

export type ImageUploadCaptureProps = {
  onSelectImage: (file: File) => void;
  onRemoveImage: () => void;
  defaultUrl?: string;
  label?: string;
  optional?: boolean;
};

export default function ImageUploadCapture({
  onSelectImage,
  onRemoveImage,
  defaultUrl = '',
  label,
  optional,
}: ImageUploadCaptureProps) {
  const { t } = useTranslation();
  const deviceType = getDeviceType();
  const showTakePhoto = deviceType !== 'desktop';

  const [localUrl, setLocalUrl] = useState<string | null>(null);
  const [showFileSizeExceedsModal, setShowFileSizeExceedsModal] = useState(false);
  const dropContainerRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();

  const previewUrl = localUrl ?? defaultUrl;

  useEffect(() => {
    return () => {
      if (localUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(localUrl);
      }
    };
  }, [localUrl]);

  const handleFile = async (file: File) => {
    if (!isImageFile(file)) {
      dispatch(enqueueErrorSnackbar(t('UPLOADER.UNSUPPORTED_FILE_TYPE')));
      return;
    }

    if (file.size > MAX_ACCEPTED_FILE_SIZE) {
      setShowFileSizeExceedsModal(true);
      return;
    }

    let imageFile: File = file;

    if (file.size > COMPRESSION_THRESHOLD) {
      try {
        const blob = await compressImage(file);
        imageFile = new File([blob], file.name, { type: blob.type });
      } catch {
        // Compression fails for e.g. DNG (RAW) or HEIC on non-Safari browsers
        dispatch(enqueueErrorSnackbar(t('UPLOADER.UNSUPPORTED_FILE_TYPE')));
        return;
      }
    }

    const url = URL.createObjectURL(imageFile);
    setLocalUrl(url);
    onSelectImage(imageFile);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) {
      return;
    }
    handleFile(e.target.files[0]);
    e.target.value = '';
  };

  const handleRemove = () => {
    setLocalUrl('');
    onRemoveImage();
  };

  const handleDragEvent = (e: DragEvent) => {
    e.preventDefault();
    if (e.type === 'dragover') return;

    if (e.type === 'dragenter' || e.type === 'dragleave') {
      dropContainerRef.current?.classList.toggle(styles.dropContainerActive);
    } else if (e.type === 'drop') {
      dropContainerRef.current?.classList.remove(styles.dropContainerActive);
      const file = e.dataTransfer?.files[0];
      if (file) {
        handleFile(file);
      }
    }
  };

  return (
    <>
      {showFileSizeExceedsModal && (
        <FileSizeExceedModal size={50} dismissModal={() => setShowFileSizeExceedsModal(false)} />
      )}

      <div className={styles.section}>
        {label && <InputBaseLabel label={label} optional={optional} />}

        <div
          ref={dropContainerRef}
          className={clsx(
            styles.body,
            previewUrl ? styles.bodyWithPreview : !showTakePhoto && styles.dragDropZone,
          )}
          onDrop={handleDragEvent}
          onDragEnter={handleDragEvent}
          onDragLeave={handleDragEvent}
          onDragOver={handleDragEvent}
        >
          {previewUrl ? (
            <>
              <img className={styles.preview} src={previewUrl} alt="" />
              <div className={styles.previewActions}>
                <TextButton type="button">
                  <PureFilePickerWrapper
                    accept="image/*"
                    onChange={handleChange}
                    className={styles.actionBtn}
                  >
                    <EditIcon />
                    {t('UPLOADER.CHANGE_IMAGE')}
                  </PureFilePickerWrapper>
                </TextButton>
                <TextButton type="button" className={styles.actionBtn} onClick={handleRemove}>
                  <TrashIcon />
                  {t('UPLOADER.REMOVE_IMAGE')}
                </TextButton>
              </div>
            </>
          ) : (
            <>
              <PureFilePickerWrapper
                accept="image/*"
                onChange={handleChange}
                className={styles.photoBtnWrapper}
              >
                <div className={styles.photoBtn}>
                  <div className={styles.photoBtnIcon}>
                    <PhotoLibraryIcon />
                  </div>
                  <span className={styles.photoBtnLabel}>
                    {showTakePhoto
                      ? t('IMAGE_UPLOAD_CAPTURE.PHOTO_LIBRARY')
                      : t('UPLOADER.CLICK_TO_UPLOAD')}
                  </span>
                </div>
              </PureFilePickerWrapper>

              {showTakePhoto && (
                <PureFilePickerWrapper
                  accept="image/*"
                  capture="environment"
                  onChange={handleChange}
                  className={styles.photoBtnWrapper}
                >
                  <div className={styles.photoBtn}>
                    <div className={styles.photoBtnIcon}>
                      <CameraIcon />
                    </div>
                    <span className={styles.photoBtnLabel}>
                      {t('IMAGE_UPLOAD_CAPTURE.TAKE_PHOTO')}
                    </span>
                  </div>
                </PureFilePickerWrapper>
              )}

              {!showTakePhoto && (
                <span className={styles.dragDropLabel}>{t('UPLOADER.DRAG_DROP')}</span>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
