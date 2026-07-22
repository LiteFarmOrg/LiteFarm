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
import { isFileTypeAllowed, isImageUrl } from '../../util/validation';
import { FileEvent, OnFileUpload } from '.';

export type GetOnFileUpload = (
  targetRoute: string,
  onSelectImage: (imageUrl: string) => void,
  accept?: string,
  onLoading?: (loading: boolean) => void,
  // For private-bucket callers only — fetches a fresh upload's raw file URL with authentication
  // and returns a blob: URL that can actually be shown as the preview. Omit for public-bucket
  // callers, where the raw URL returned by the upload is already directly viewable.
  resolvePreviewUrl?: (url: string) => Promise<string>,
) => OnFileUpload;

/**
 * Custom hook designed to be used as a helper for the `SingleFilePicker` component to save the
 * image URL rather than the file itself. (Created by extracting the logic from `ImagePickerWrapper`.)
 *
 * While the hook could be simplified by directly taking `targetRoute`, `onSelectImage`, and `onLoading`
 * as parameters, the current structure provides greater flexibility. It allows parent containers to call
 * the hook and delegate the specifics of these parameters to child components.
 *
 * @example
 * const { getOnFileUpload } = useSingleFilePickerUpload();
 * const onFileUpload = getOnFileUpload('/upload-endpoint', onSelectImage, onLoading);
 *
 * <SingleFilePicker
 *   label={"label"}
 *   onFileUpload={onFileUpload}
 *   onRemoveImage={() => console.log('remove')}
 * />
 */
export default function useSingleFilePickerUpload(): { getOnFileUpload: GetOnFileUpload } {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const getOnUploadSuccess =
    (
      setPreviewUrl: (url: string) => void,
      onSelectImage: (imageUrl: string) => void,
      resolvePreviewUrl?: (url: string) => Promise<string>,
    ) =>
    async (url: string, onLoading?: (loading: boolean) => void) => {
      // isImageUrl(url) confirms url is a real image (checked by extension before any
      // resolving happens). If it isn't, this hook has no way to preview it — not yet needed
      // by any caller, since every current accept list is images-only — so fail loudly rather
      // than render it wrong.
      if (!isImageUrl(url)) {
        throw new Error(
          'useSingleFilePickerUpload: non-image upload — preview not implemented for this caller.',
        );
      }
      setPreviewUrl(resolvePreviewUrl ? await resolvePreviewUrl(url) : url);
      onSelectImage(url);
      onLoading?.(false);
    };

  const getOnUploadFail = (onLoading?: (loading: boolean) => void) => (error: string) => {
    if (error) console.log(error);
    onLoading?.(false);
  };

  const getOnFileUpload: GetOnFileUpload =
    (targetRoute, onSelectImage, accept = 'image/*', onLoading, resolvePreviewUrl) =>
    async (event, setPreviewUrl, setFileSizeExceeded, eventType) => {
      onLoading?.(true);

      const blob =
        eventType === FileEvent.CHANGE
          ? (event as ChangeEvent<HTMLInputElement>)?.target?.files?.[0]
          : (event as DragEvent).dataTransfer?.files?.[0];

      if (blob) {
        const onUploadFail = getOnUploadFail(onLoading);
        const onUploadSuccess = getOnUploadSuccess(setPreviewUrl, onSelectImage, resolvePreviewUrl);

        if (!isFileTypeAllowed(blob, accept)) {
          dispatch(enqueueErrorSnackbar(t('UPLOADER.UNSUPPORTED_FILE_TYPE')));
          onUploadFail('Not an allowed file type');
        } else {
          if (blob.size > 5e6) {
            setFileSizeExceeded(true);
            return;
          }

          dispatch(
            // @ts-expect-error
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
