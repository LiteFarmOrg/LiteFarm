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

import { ChangeEvent, useState } from 'react';
import { MediaWithAuthentication } from '../../../containers/MediaWithAuthentication';
import PureFilePickerWrapper from '../../Form/FilePickerWrapper';
import TextButton from '../../Form/Button/TextButton';
import styles from './styles.module.scss';
import { ReactComponent as CameraIcon } from '../../../assets/images/farm-profile/camera.svg';
import { ReactComponent as TrashIcon } from '../../../assets/images/farm-profile/trash.svg';
import { ReactComponent as EditIcon } from '../../../assets/images/farm-profile/edit.svg';

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

  const isImagePickerShown = isImageRemoved || (!previewUrl && !thumbnailUrl);

  const handleRemoveImage = () => {
    onRemoveImage();
    setPreviewUrl('');
  };

  const handleSelectImage = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result as string);
      onSelectImage(file);
    };
    reader.readAsDataURL(file);
  };

  return isImagePickerShown ? (
    <PureFilePickerWrapper accept="image/*" onChange={handleSelectImage}>
      <span className={styles.filePicker}>
        <CameraIcon /> Upload Image
      </span>
    </PureFilePickerWrapper>
  ) : (
    <div className={styles.imageContainer}>
      {previewUrl ? (
        <img src={previewUrl} alt="image preview" />
      ) : (
        <MediaWithAuthentication fileUrls={[thumbnailUrl]} alt="image thumbnail" />
      )}
      <div className={styles.imageActions}>
        <PureFilePickerWrapper onChange={handleSelectImage} accept="image/*">
          <TextButton type="button">
            <EditIcon />
            Change Image
          </TextButton>
        </PureFilePickerWrapper>
        <TextButton type="button" onClick={handleRemoveImage}>
          <TrashIcon />
          Remove Image
        </TextButton>
      </div>
    </div>
  );
}
