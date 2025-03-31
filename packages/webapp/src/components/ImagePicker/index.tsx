/*
 *  Copyright 2024 LiteFarm.org
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
import clsx from 'clsx';
import { AddLink } from '../Typography';
import PureFilePickerWrapper from '../Form/FilePickerWrapper';
import TextButton from '../Form/Button/TextButton';
import InputBaseLabel from '../Form/InputBase/InputBaseLabel';
import { ReactComponent as CameraIcon } from '../../assets/images/farm-profile/camera.svg';
import { ReactComponent as TrashIcon } from '../../assets/images/farm-profile/trash.svg';
import { ReactComponent as EditIcon } from '../../assets/images/farm-profile/edit.svg';
import styles from './styles.module.scss';
import FileSizeExceedModal from '../Modals/FileSizeExceedModal';

export enum FileEvent {
  CHANGE = 'change',
  DRAG = 'drag',
}

export type OnFileUpload = (
  event: ChangeEvent<HTMLInputElement> | DragEvent,
  setPreviewUrl: (url: string) => void,
  setFileSizeExceeded: (exceeded: boolean) => void,
  eventType: FileEvent,
) => Promise<void>;

type CommonProps = {
  onRemoveImage: () => void;
  label?: string;
  optional?: boolean;
  defaultUrl?: string;
  isDisabled?: boolean;
  shouldReset?: boolean;
};

type CustomFileUpload = CommonProps & {
  onSelectImage?: never;
  onFileUpload: OnFileUpload;
  shouldReset?: never;
};

type DirectImageUpload = CommonProps & {
  onSelectImage: (file: File) => void;
  onFileUpload?: never;
  shouldReset?: boolean;
};

export type ImagePickerProps = CustomFileUpload | DirectImageUpload;

export default function ImagePicker({
  onRemoveImage,
  onSelectImage,
  defaultUrl = '',
  label,
  optional = true, // false is not yet supported
  onFileUpload,
  isDisabled = false,
  shouldReset,
}: ImagePickerProps) {
  const [previewUrl, setPreviewUrl] = useState(defaultUrl);
  const [showFileSizeExceedsModal, setShowFileSizeExceedsModal] = useState(false);
  const dropContainerRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  useEffect(() => {
    if (shouldReset) {
      removeImage();
    }
  }, [shouldReset]);

  const removeImage = () => {
    onRemoveImage();
    setPreviewUrl('');
  };

  const showImage = (file: File) => {
    if (file.size > 5e6) {
      setShowFileSizeExceedsModal(true);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    onSelectImage?.(file);
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (onFileUpload) {
      onFileUpload(e, setPreviewUrl, setShowFileSizeExceedsModal, FileEvent.CHANGE);
      return;
    }

    if (!e.target.files) return;
    const file = e.target.files[0];
    showImage(file);
    e.target.value = '';
  };

  const handleDragEvent = (e: DragEvent) => {
    e.preventDefault();
    if (e.type === 'dragover') return;

    if (e.type === 'dragenter' || e.type === 'dragleave') {
      dropContainerRef.current?.classList.toggle(styles.dropContainerActive);
    } else if (e.type === 'drop') {
      if (onFileUpload) {
        onFileUpload(e, setPreviewUrl, setShowFileSizeExceedsModal, FileEvent.DRAG);
        return;
      }

      const file = e.dataTransfer?.files[0];
      showImage(file);
    }
  };

  useEffect(() => {
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  return (
    <>
      {showFileSizeExceedsModal && (
        <FileSizeExceedModal size={5} dismissModal={() => setShowFileSizeExceedsModal(false)} />
      )}
      <div>
        {label && <InputBaseLabel label={label} optional={optional} />}
        {previewUrl ? (
          <div className={clsx(styles.imageContainer, isDisabled && styles.disabled)}>
            <img src={previewUrl} alt="image preview" />
            <div className={styles.imageActions}>
              <PureFilePickerWrapper
                onChange={handleFileInputChange}
                accept="image/*"
                disabled={isDisabled}
              >
                <TextButton type="button" className={styles.editButton}>
                  <EditIcon />
                  {t('UPLOADER.CHANGE_IMAGE')}
                </TextButton>
              </PureFilePickerWrapper>
              <TextButton type="button" onClick={removeImage} className={styles.editButton}>
                <TrashIcon />
                {t('UPLOADER.REMOVE_IMAGE')}
              </TextButton>
            </div>
          </div>
        ) : (
          <>
            <PureFilePickerWrapper
              accept="image/*"
              className={clsx(styles.filePickerWrapper, isDisabled && styles.disabled)}
              onChange={handleFileInputChange}
              disabled={isDisabled}
            >
              <span className={styles.filePickerBtn}>
                <CameraIcon /> {t('UPLOADER.UPLOAD_IMAGE')}
              </span>
            </PureFilePickerWrapper>
            <div
              ref={dropContainerRef}
              className={clsx(styles.dropContainer, isDisabled && styles.disabled)}
              onDrop={handleDragEvent}
              onDragEnter={handleDragEvent}
              onDragLeave={handleDragEvent}
              onDragOver={handleDragEvent}
            >
              <CameraIcon className={styles.cameraIcon} />
              <div className={styles.flexWrapper}>
                <PureFilePickerWrapper accept="image/*" onChange={handleFileInputChange}>
                  <AddLink> {t('UPLOADER.CLICK_TO_UPLOAD')}</AddLink>
                </PureFilePickerWrapper>
                <span> {t('UPLOADER.DRAG_DROP')}</span>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
