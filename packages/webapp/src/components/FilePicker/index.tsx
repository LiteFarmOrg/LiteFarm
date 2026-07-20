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

import styles from './styles.module.scss';
import { ContainerWithIcon } from '../ContainerWithIcon/ContainerWithIcon';
import { ReactComponent as TrashIcon } from '../../assets/images/document/trash.svg';
import { FilePickerFunctions } from './useFilePickerUpload';
import { mediaEnum } from '../../containers/MediaWithAuthentication/constants';
import MenuItem from '../MenuItem';
import { Loading } from '../Loading/Loading';

type UploadedFile = {
  thumbnail_url: string;
  file_name: string;
  url: string;
};

type FilePickerProps = {
  uploadedFiles: UploadedFile[];
  linkText: string;
  showUploader: boolean;
  showLoading: boolean;
} & FilePickerFunctions;

/**
 * A picker for multiple files per field (a record with several attachments) — list-oriented,
 * always uploads on select.
 *
 * If you need a single file per field instead, see the sibling `SingleFilePicker` component —
 * it's standalone with no Redux coupling, usable anywhere.
 */
const FilePicker = ({
  uploadedFiles,
  deleteImage,
  imageComponent,
  documentUploader,
  onUpload,
  onUploadEnd,
  showLoading,
  linkText,
  showUploader,
}: FilePickerProps) => {
  return (
    <div className={styles.filePickerContainer}>
      {uploadedFiles?.map(({ thumbnail_url, file_name, url }) => (
        <ContainerWithIcon
          icon={<TrashIcon />}
          onIconClick={() => {
            deleteImage(url);
            onUploadEnd();
          }}
          key={thumbnail_url}
          style={{ width: '100%', maxWidth: thumbnail_url ? '312px' : undefined }}
        >
          {thumbnail_url ? (
            imageComponent({
              width: '100%',
              style: { width: '100%', height: '100%' },
              height: '100%',
              fileUrls: [thumbnail_url],
              mediaType: mediaEnum.IMAGE,
            })
          ) : (
            <MenuItem label={file_name} />
          )}
        </ContainerWithIcon>
      ))}
      {showLoading && <Loading style={{ minHeight: '192px', width: '100%', maxWidth: '312px' }} />}
      {showUploader &&
        documentUploader({
          style: { paddingBottom: '32px' },
          linkText: linkText,
          onUpload,
          onUploadEnd,
        })}
    </div>
  );
};

export default FilePicker;
