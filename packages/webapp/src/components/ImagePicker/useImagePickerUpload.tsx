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
import { FileEvent } from '.';

type GetOnFileUpload = (
  targetRoute: string,
  onSelectImage: (imageUrl: string) => void,
  onLoading?: (loading: boolean) => void,
) => (
  e: ChangeEvent<HTMLInputElement> | DragEvent,
  setPreviewUrl: (url: string) => void,
  event: FileEvent,
) => Promise<void>;

/**
 * Custom hook designed to be used as a helper for the `ImagePicker` component to save the image URL
 * rather than the file itself. (Created by extracting the logic from `ImagePickerWrapper`.)
 *
 * This hook could be simplified by directly taking `targetRoute`, `onSelectImage`, and `onLoading`
 * as parameters rather than passing these to the returned `getOnFileUpload` function. However, the
 * current structure allows for more flexibility. (Call the hook in a container and delegate the
 * detailed implementation in its child component - this keeps components pure and prevent stories
 * from being broken.)
 *
 * @example
 * const { getOnFileUpload } = useImagePickerUpload();
 * const onFileUpload = getOnFileUpload('/upload-endpoint', onSelectImage, onLoading);
 *
 * <ImagePicker
 *   label={"label"}
 *   shouldGetImageUrl={true}
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
    (targetRoute, onSelectImage, onLoading) => async (e, setPreviewUrl, event) => {
      onLoading?.(true);

      const blob =
        event === FileEvent.CHANGE
          ? (e as ChangeEvent<HTMLInputElement>)?.target?.files?.[0]
          : (e as DragEvent).dataTransfer?.files?.[0];

      if (blob) {
        const onUploadFail = getOnUploadFail(onLoading);
        const onUploadSuccess = getOnUploadSuccess(setPreviewUrl, onSelectImage);

        const isNotImage = !/^image\/.*/.test(blob.type);
        if (isNotImage) {
          dispatch(enqueueErrorSnackbar(t('message:ATTACHMENTS.ERROR.FAILED_UPLOAD')));
          onUploadFail('Not an image file');
        } else if (blob.size < 200000) {
          dispatch(
            // @ts-ignore
            uploadImage({
              file: blob,
              onUploadSuccess,
              onUploadFail,
              targetRoute,
            }),
          );
        } else {
          const Compressor = await import('compressorjs').then((Compressor) => Compressor.default);
          new Compressor(blob, {
            quality: blob.size > 1000000 ? 0.6 : 0.8,
            convertSize: 200000,
            success(compressedBlob) {
              dispatch(
                // @ts-ignore
                uploadImage({
                  file: compressedBlob,
                  onUploadSuccess,
                  onUploadFail,
                  targetRoute,
                }),
              );
            },
            error(err) {
              onUploadFail(err.message);
            },
          });
        }
      } else {
        // E.g. file picker is cancelled so no files are present
        onLoading?.(false);
      }
    };

  return { getOnFileUpload };
}
