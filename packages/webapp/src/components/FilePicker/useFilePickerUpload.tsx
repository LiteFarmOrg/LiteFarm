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
  onUpload: () => void;
  onUploadEnd: () => void;
};

type FilePickerHookUtilities = FilePickerFunctions & {
  isUploading: boolean;
};

/**
 * Custom hook designed to be used as a helper for the `FilePicker` component to.
 *
 */
export default function useFilePickerUpload(): FilePickerHookUtilities {
  const dispatch = useDispatch();

  const [isUploading, setIsUploading] = useState(false);

  const onUpload = () => {
    setIsUploading(true);
  };

  const onUploadEnd = () => {
    setIsUploading(false);
  };

  const deleteImage = (url: URL): void => {
    dispatch(deleteUploadedFile({ url }));
  };
  const imageComponent = (props: any) => <MediaWithAuthentication {...props} />;
  const documentUploader = (props: any) => <DocumentUploader {...props} />;

  return { deleteImage, imageComponent, documentUploader, onUpload, onUploadEnd, isUploading };
}
