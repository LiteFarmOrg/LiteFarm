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
import { useDispatch } from 'react-redux';
import clsx from 'clsx';
import { AddLink } from '../Typography';
import PureFilePickerWrapper from '../Form/FilePickerWrapper';
import TextButton from '../Form/Button/TextButton';
import InputBaseLabel from '../Form/InputBase/InputBaseLabel';
import { ReactComponent as CameraIcon } from '../../assets/images/farm-profile/camera.svg';
import { ReactComponent as TrashIcon } from '../../assets/images/farm-profile/trash.svg';
import { ReactComponent as EditIcon } from '../../assets/images/farm-profile/edit.svg';
import { enqueueErrorSnackbar } from '../../containers/Snackbar/snackbarSlice';
import { isFileTypeAllowed, isImageFile, isImageUrl } from '../../util/validation';
import MenuItem from '../MenuItem';
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
  // HTML accept-attribute-style string, e.g. "image/*,application/pdf". Defaults to images only.
  accept?: string;
  // Display name for a non-image defaultUrl (edit mode) — e.g. from toDocumentFileName(value, t).
  // Not needed for a freshly-selected file this session, since that name is captured directly.
  fileName?: string;
};

/**
 * CustomFileUpload pattern: For immediate upload of images
 *
 * This pattern is used with the useSingleFilePickerUpload hook to:
 * 1. Upload the image immediately when selected
 * 2. Store the resulting URL in your form (not the File)
 */
type CustomFileUpload = CommonProps & {
  onSelectImage?: never;
  onFileUpload: OnFileUpload;
  shouldReset?: never;
};

/* DirectImageUpload pattern: For storing File objects in form state
 *
 * This pattern is used when you want to:
 * 1. Get the raw File object when user selects an image
 * 2. Store that File object directly in your form
 * 3. Upload the file when form is submitted
 *
 * The parent component receives the File via onSelectImage callback and is responsible for storing it.
 */
type DirectImageUpload = CommonProps & {
  onSelectImage: (file: File) => void;
  onFileUpload?: never;
  shouldReset?: boolean;
};

export type SingleFilePickerProps = CustomFileUpload | DirectImageUpload;

/**
 * A standalone picker for a single file per field — no Redux coupling, usable anywhere. Choose
 * upload timing via the two prop patterns above: `onFileUpload` (upload immediately, store the
 * resulting URL) or `onSelectImage` (hold the File, send it with the form's own Submit request).
 *
 * If you need multiple files per field instead (e.g. a record with several attachments), see the
 * sibling `FilePicker` component — it's list-oriented and always uploads on select.
 */
export default function SingleFilePicker({
  onRemoveImage,
  onSelectImage,
  defaultUrl = '',
  label,
  optional = true, // false is not yet supported
  onFileUpload,
  isDisabled = false,
  shouldReset,
  accept = 'image/*',
  fileName,
}: SingleFilePickerProps) {
  const [previewUrl, setPreviewUrl] = useState(defaultUrl);
  // Tracks whether previewUrl is a real image (render <img>) or not (render a filename fallback).
  // Kept alongside previewUrl rather than derived from it on every render, since a freshly-picked
  // local blob: URL (onSelectImage path) has no extension to check — only the originating File does.
  const [isPreviewImage, setIsPreviewImage] = useState(() => isImageUrl(defaultUrl));
  // Only set for a file picked this session via onSelectImage — the fileName prop covers the rest.
  const [previewFileName, setPreviewFileName] = useState<string>();
  const [showFileSizeExceedsModal, setShowFileSizeExceedsModal] = useState(false);
  const dropContainerRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();
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

  // Wraps ImagePicker's own setPreviewUrl (passed into the external onFileUpload callback) so
  // isPreviewImage stays correct once the upload resolves to a real remote URL — that URL has a
  // real extension, unlike a local blob: URL, so isImageUrl is safe to check directly here.
  const setUploadedPreviewUrl = (url: string) => {
    setPreviewUrl(url);
    setIsPreviewImage(isImageUrl(url));
    setPreviewFileName(undefined);
  };

  const showImage = (file: File) => {
    if (!isFileTypeAllowed(file, accept)) {
      dispatch(enqueueErrorSnackbar(t('UPLOADER.UNSUPPORTED_FILE_TYPE')));
      return;
    }

    if (file.size > 5e6) {
      setShowFileSizeExceedsModal(true);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setIsPreviewImage(isImageFile(file));
    setPreviewFileName(file.name);
    onSelectImage?.(file);
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (onFileUpload) {
      onFileUpload(e, setUploadedPreviewUrl, setShowFileSizeExceedsModal, FileEvent.CHANGE);
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
        onFileUpload(e, setUploadedPreviewUrl, setShowFileSizeExceedsModal, FileEvent.DRAG);
        return;
      }

      const file = e.dataTransfer?.files[0];
      showImage(file);
    }
  };

  useEffect(() => {
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  // Only relevant when isPreviewImage is false — previewFileName (picked this session) wins,
  // then the caller-supplied fileName (existing value), then the URL's own last path segment.
  // previewUrl can be null at runtime despite its string type (e.g. a form field whose empty
  // value is null, not undefined, bypassing the defaultUrl='' default parameter).
  const fallbackFileName = previewFileName ?? fileName ?? previewUrl?.split('/').pop() ?? '';

  return (
    <>
      {showFileSizeExceedsModal && (
        <FileSizeExceedModal size={5} dismissModal={() => setShowFileSizeExceedsModal(false)} />
      )}
      <div>
        {label && <InputBaseLabel label={label} optional={optional} />}
        {previewUrl ? (
          <div className={clsx(styles.imageContainer, isDisabled && styles.disabled)}>
            {isPreviewImage ? (
              <img src={previewUrl} alt="image preview" />
            ) : (
              <MenuItem label={fallbackFileName} />
            )}
            <div className={styles.imageActions}>
              <PureFilePickerWrapper
                onChange={handleFileInputChange}
                accept={accept}
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
              accept={accept}
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
                <PureFilePickerWrapper accept={accept} onChange={handleFileInputChange}>
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
