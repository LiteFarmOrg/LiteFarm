/*
 *  Copyright 2025 LiteFarm.org
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

import { useDispatch } from 'react-redux';
import { deleteUploadedFile } from '../../containers/hooks/useHookFormPersist/hookFormPersistSlice';
import { DocumentUploader } from '../../containers/Documents/DocumentUploader';
import { MediaWithAuthentication } from '../../containers/MediaWithAuthentication';
import { useState } from 'react';

export type FilePickerFunctions = {
  deleteImage: (url: URL) => void;
  imageComponent: (props: any) => JSX.Element;
  documentUploader: (props: any) => JSX.Element;
  isFirstFileUpdateEnded: boolean;
  onFileUpdateEnd: () => void;
};

/**
 * Custom hook designed to be used as a helper for the `ImagePicker` component to save the image URL
 * rather than the file itself. (Created by extracting the logic from `ImagePickerWrapper`.)
 *
 * While the hook could be simplified by directly taking `targetRoute`, `onSelectImage`, and `onLoading`
 * as parameters, the current structure provides greater flexibility. It allows parent containers to call
 * the hook and delegate the specifics of these parameters to child components.
 *
 * @example
 * const { getOnFileUpload } = useFilePickerUpload();
 * const onFileUpload = getOnFileUpload('/upload-endpoint', onSelectImage, onLoading);
 *
 * <ImagePicker
 *   label={"label"}
 *   onFileUpload={onFileUpload}
 *   onRemoveImage={() => console.log('remove')}
 * />
 */
export default function useFilePickerUpload(): FilePickerFunctions {
  const dispatch = useDispatch();

  const deleteImage = (url: URL): void => {
    dispatch(deleteUploadedFile({ url }));
  };
  const imageComponent = (props: any) => <MediaWithAuthentication {...props} />;
  const documentUploader = (props: any) => <DocumentUploader {...props} />;

  const [isFirstFileUpdateEnded, setIsFilesUpdated] = useState(false);
  const onFileUpdateEnd = () => {
    setIsFilesUpdated(true);
  };
  return { deleteImage, imageComponent, documentUploader, isFirstFileUpdateEnded, onFileUpdateEnd };
}
