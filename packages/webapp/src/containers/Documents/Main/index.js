import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ImageWithAuthentication } from '../../ImageWithAuthentication';
import MainDocumentView from '../../../components/Documents/Main';
import { documentSelector } from '../../documentSlice';
import ArchiveDocumentModal from '../../../components/Modals/ArchiveDocumentModal';
import { archiveDocument } from '../saga';
import TaskQuickAssignModal from '../../../components/Task/QuickAssign';

export default function MainDocument({ history, match }) {
  const { document_id } = match.params;
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const dispatch = useDispatch();
  const document = useSelector(documentSelector(document_id));
  const onGoBack = () => {
    history.push('/documents');
  };

  const onRetire = () => {
    dispatch(archiveDocument(document_id));
  };

  const onUpdate = () => {
    history.push(`/documents/${document_id}/edit_document`);
  };

  return (
    <>
      <MainDocumentView
        onGoBack={onGoBack}
        imageComponent={(props) => <ImageWithAuthentication {...props} />}
        onUpdate={onUpdate}
        onRetire={() => setShowArchiveModal(true)}
        document={document}
      />
      {showArchiveModal && (
        // TODO - For testing only
        // <ArchiveDocumentModal
        //   dismissModal={() => setShowArchiveModal(false)}
        //   onArchive={onRetire}
        // />
        <TaskQuickAssignModal
          dismissModal={() => setShowArchiveModal(false)}
        />
      )}
    </>
  );
}
