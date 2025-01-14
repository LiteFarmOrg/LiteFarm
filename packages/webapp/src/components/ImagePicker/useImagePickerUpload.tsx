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

import { ChangeEvent, DragEvent } from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { enqueueErrorSnackbar } from '../../containers/Snackbar/snackbarSlice';
import { uploadImage } from '../../containers/ImagePickerWrapper/saga';
import { FileEvent, OnFileUpload } from '.';

export type GetOnFileUpload = (
  targetRoute: string,
  onSelectImage: (imageUrl: string) => void,
  onLoading?: (loading: boolean) => void,
) => OnFileUpload;

/**
 * Custom hook designed to be used as a helper for the `ImagePicker` component to save the image URL
 * rather than the file itself. (Created by extracting the logic from `ImagePickerWrapper`.)
 *
 * While the hook could be simplified by directly taking `targetRoute`, `onSelectImage`, and `onLoading`
 * as parameters, the current structure provides greater flexibility. It allows parent containers to call
 * the hook and delegate the specifics of these parameters to child components.
 *
 * @example
 * const { getOnFileUpload } = useImagePickerUpload();
 * const onFileUpload = getOnFileUpload('/upload-endpoint', onSelectImage, onLoading);
 *
 * <ImagePicker
 *   label={"label"}
 *   onFileUpload={onFileUpload}
 *   onRemoveImage={() => console.log('remove')}
 * />
 */
export default function useImagePickerUpload(): { getOnFileUpload: GetOnFileUpload } {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const getOnUploadSuccess =
    (setPreviewUrl: (url: string) => void, onSelectImage: (imageUrl: string) => void) =>
    (url: string, onLoading?: (loading: boolean) => void) => {
      setPreviewUrl(url);
      onSelectImage(url);
      onLoading?.(false);
    };

  const getOnUploadFail = (onLoading?: (loading: boolean) => void) => (error: string) => {
    if (error) console.log(error);
    onLoading?.(false);
  };

  const getOnFileUpload: GetOnFileUpload =
    (targetRoute, onSelectImage, onLoading) =>
    async (event, setPreviewUrl, setFileSizeExceeded, eventType) => {
      onLoading?.(true);

      const blob =
        eventType === FileEvent.CHANGE
          ? (event as ChangeEvent<HTMLInputElement>)?.target?.files?.[0]
          : (event as DragEvent).dataTransfer?.files?.[0];

      if (blob) {
        const onUploadFail = getOnUploadFail(onLoading);
        const onUploadSuccess = getOnUploadSuccess(setPreviewUrl, onSelectImage);

        const isNotImage = !/^image\/.*/.test(blob.type);
        if (isNotImage) {
          dispatch(enqueueErrorSnackbar(t('message:ATTACHMENTS.ERROR.FAILED_UPLOAD')));
          onUploadFail('Not an image file');
        } else {
          if (blob.size > 5e6) {
            setFileSizeExceeded(true);
            return;
          }

          dispatch(
            // @ts-ignore
            uploadImage({
              file: blob,
              onUploadSuccess,
              onUploadFail,
              targetRoute,
            }),
          );
        }
      } else {
        // E.g. file picker is cancelled so no files are present
        onLoading?.(false);
      }
    };

  return { getOnFileUpload };
}
