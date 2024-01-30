/*
 *  Copyright 2023 LiteFarm.org
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
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { MediaWithAuthentication } from '../../../containers/MediaWithAuthentication';
import PureFilePickerWrapper from '../../Form/FilePickerWrapper';
import TextButton from '../../Form/Button/TextButton';
import styles from './styles.module.scss';
import CameraIcon from '../../../assets/images/farm-profile/camera.svg';
import TrashIcon from '../../../assets/images/farm-profile/trash.svg';
import EditIcon from '../../../assets/images/farm-profile/edit.svg';
import { AddLink } from '../../Typography';
import { useTranslation } from 'react-i18next';

type FarmImagePickerProps = {
  onSelectImage: (file: File) => void;
  onRemoveImage: () => void;
  isImageRemoved: boolean;
  thumbnailUrl: string;
};

export default function FarmImagePicker({
  onRemoveImage,
  onSelectImage,
  isImageRemoved,
  thumbnailUrl,
}: FarmImagePickerProps) {
  const [previewUrl, setPreviewUrl] = useState('');
  const dropContainerRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  const isImagePickerShown = isImageRemoved || (!previewUrl && !thumbnailUrl);

  const removeImage = () => {
    onRemoveImage();
    setPreviewUrl('');
  };

  const showImage = (file: File) => {
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    onSelectImage(file);
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const file = e.target.files[0];
    showImage(file);
  };

  const handleDragEvent = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.type === 'dragover') return;

    if (e.type === 'dragenter' || e.type === 'dragleave') {
      dropContainerRef.current?.classList.toggle(styles.dropContainerActive);
    } else if (e.type === 'drop') {
      const file = e.dataTransfer?.files[0];
      if (file) showImage(file);
    }
  };

  useEffect(() => {
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  return isImagePickerShown ? (
    <>
      <PureFilePickerWrapper
        accept="image/*"
        className={styles.filePickerWrapper}
        onChange={handleFileInputChange}
      >
        <span className={styles.filePickerBtn}>
          <CameraIcon /> {t('PROFILE.FARM.UPLOAD_IMAGE')}
        </span>
      </PureFilePickerWrapper>
      <div
        ref={dropContainerRef}
        className={styles.dropContainer}
        onDrop={handleDragEvent}
        onDragEnter={handleDragEvent}
        onDragLeave={handleDragEvent}
        onDragOver={handleDragEvent}
      >
        <CameraIcon className={styles.cameraIcon} />
        <div className={styles.flexWrapper}>
          <PureFilePickerWrapper accept="image/*" onChange={handleFileInputChange}>
            <AddLink> {t('PROFILE.FARM.CLICK_TO_UPLOAD')}</AddLink>
          </PureFilePickerWrapper>
          <span> {t('PROFILE.FARM.DRAG_DROP')}</span>
        </div>
      </div>
    </>
  ) : (
    <div className={styles.imageContainer}>
      {previewUrl ? (
        <img src={previewUrl} alt="image preview" />
      ) : (
        <MediaWithAuthentication fileUrls={[thumbnailUrl]} alt="image thumbnail" />
      )}
      <div className={styles.imageActions}>
        <PureFilePickerWrapper onChange={handleFileInputChange} accept="image/*">
          <TextButton type="button">
            <EditIcon />
            {t('PROFILE.FARM.CHANGE_IMAGE')}
          </TextButton>
        </PureFilePickerWrapper>
        <TextButton type="button" onClick={removeImage}>
          <TrashIcon />
          {t('PROFILE.FARM.REMOVE_IMAGE')}
        </TextButton>
      </div>
    </div>
  );
}
