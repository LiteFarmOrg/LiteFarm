import React, { useEffect } from 'react';
import PureDocumentDetailView from '../../../components/Documents/Add';
import { useDispatch, useSelector } from 'react-redux';
import {
  deleteUploadedFile,
  hookFormPersistSelector,
  initEditDocument,
} from '../../hooks/useHookFormPersist/hookFormPersistSlice';
import { ImageWithAuthentication } from '../../ImageWithAuthentication';
import { documentSelector } from '../../documentSlice';
import useHookFormPersist from '../../hooks/useHookFormPersist';
import { DocumentUploader } from '../DocumentUploader';
import { updateDocument } from '../saga';

export default function EditDocument({ history, match }) {
  const dispatch = useDispatch();
  const { document_id } = match.params;

  const document = useSelector(documentSelector(document_id));
  const { uploadedFiles } = useSelector(hookFormPersistSelector);

  useEffect(() => {
    if (!uploadedFiles) {
      dispatch(initEditDocument(document.files));
    }
  }, []);
  const onGoBack = () => {
    history.push(`/documents/${document_id}`);
  };

  const onSubmit = (data) => {
    // TODO - Add functionality to PATCH
    console.log(data);
    let newFiles = [];
    let deleted = [];
    // data.files.forEach((file) => {
    //   if (!('file_id' in file) && !deletedFiles.includes(file.url)) {
    //     newFiles.push(file);
    //   }
    //   // if (deletedFiles.includes(file.url) && ('file_id' in file)) {
    //   //   deleted.push(file);
    //   // }
    // });
    let fileUrls = document
    data.files.forEach((file) => {
      // if (file)
    });
    console.log(newFiles);
    console.log(document.files);
    // dispatch(updateDocument({
    //   document_id: document_id,
    //   documentData: data
    // }));
  };

  const deleteImage = (url) => {
    dispatch(deleteUploadedFile({ thumbnail_url: url }));
  };

  return (
    <>
      <PureDocumentDetailView
        onGoBack={onGoBack}
        submit={onSubmit}
        deleteImage={deleteImage}
        isEdit={true}
        persistedFormData={document}
        useHookFormPersist={useHookFormPersist}
        imageComponent={(props) => <ImageWithAuthentication {...props} />}
        documentUploader={(props) => <DocumentUploader {...props} />}
      />
    </>
  );
}
