/*
 *  Copyright 2019, 2020, 2021, 2022 LiteFarm.org
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
 *  GNU General Public License for more details, see <<https://www.gnu.org/licenses/>.>
 */

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ImageWithAuthentication } from '../../ImageWithAuthentication';
import { DocumentWithAuthentication } from '../../DocumentWithAuthentication';
import MainDocumentView from '../../../components/Documents/Main';
import { documentSelector } from '../../documentSlice';
import ArchiveDocumentModal from '../../../components/Modals/ArchiveDocumentModal';
import { archiveDocument } from '../saga';

export default function MainDocument({ history, match }) {
  const { document_id } = match.params;
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const dispatch = useDispatch();
  const document = useSelector(documentSelector(document_id));
  const onGoBack = () => {
    history.push('/documents');
  };

  const onSetArchive = () => {
    dispatch(archiveDocument({ document_id, archived: !document.archived }));
  };

  const onUpdate = () => {
    history.push(`/documents/${document_id}/edit_document`);
  };

  return (
    <>
      <MainDocumentView
        onGoBack={onGoBack}
        imageComponent={(props) => <ImageWithAuthentication {...props} />}
        fileDownloadComponent={(props) => <DocumentWithAuthentication {...props} />}
        onUpdate={onUpdate}
        onRetire={() => setShowArchiveModal(true)}
        document={document}
      />
      {showArchiveModal && (
        <ArchiveDocumentModal
          dismissModal={() => setShowArchiveModal(false)}
          onSetArchive={onSetArchive}
          isForArchiving={!document.archived} // whether this is for archiving or for unarchiving
        />
      )}
    </>
  );
}
