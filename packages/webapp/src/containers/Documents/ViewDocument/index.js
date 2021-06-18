import { useDispatch } from 'react-redux';
import { archiveDocument } from './saga';
import React, { useState } from 'react';
import ArchiveDocumentModal from '../../../components/Modals/ArchiveDocumentModal';

export function ViewDocument() {
  const dispatch = useDispatch();
  const document_id = '';
  const [showArchiveDocumentModal, setShowArchiveDocumentModal] = useState(false);
  const onArchive = () => {
    dispatch(archiveDocument(document_id));
    setShowArchiveDocumentModal(false);
  };
  return (
    <>
      <button
        onClick={() => {
          setShowArchiveDocumentModal(true);
        }}
      >
        Archive
      </button>
      {showArchiveDocumentModal && (
        <ArchiveDocumentModal
          onArchive={onArchive}
          dismissModal={() => setShowArchiveDocumentModal(false)}
        />
      )}
    </>
  );
}
