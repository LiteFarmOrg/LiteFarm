import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ImageWithAuthentication } from '../../ImageWithAuthentication';
import MainDocumentView from '../../../components/Documents/Main';
import { documentSelector } from '../../documentSlice';

export default function MainDocument({ history, match }) {
  const { document_id } = match.params;
  const dispatch = useDispatch();
  const document = useSelector(documentSelector(document_id))
  const onGoBack = () => {
    history.push('/documents');
  };

  const onRetire = () => {
  }

  const onUpdate = () => {
    history.push(`/documents/${document_id}/edit_document`)
  };

  return (
    <>
      <MainDocumentView
        onGoBack={onGoBack}
        imageComponent={ImageWithAuthentication}
        onUpdate={onUpdate}
        onRetire={onRetire}
        document={document}
      />
    </>
  );
};