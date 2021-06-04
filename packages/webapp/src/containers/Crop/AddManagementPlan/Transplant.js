import React from 'react';
import PureTransplant from '../../../components/Crop/transplant';
import { cropVarietySelector } from '../../cropVarietySlice';
import { useSelector } from 'react-redux';
import { hookFormPersistSelector } from '../../hooks/useHookFormPersist/hookFormPersistSlice';
import useHookFormPersist from '../../hooks/useHookFormPersist';

function TransplantForm({ history, match }) {
  const variety_id = match.params.variety_id;

  const variety = useSelector(cropVarietySelector(variety_id));

  const isCoverCrop = true || variety.can_be_cover_crop;

  const persistedFormData = useSelector(hookFormPersistSelector);

  return (
    <>
      <PureTransplant
        isCoverCrop={isCoverCrop}
        useHookFormPersist={useHookFormPersist}
        onGoBack={() => {
          history.push(`/crop/${variety_id}/management`);
        }}
        onCancel={() => {
          history.push(`/crop/${variety_id}/management`);
        }}
        persistedFormData={persistedFormData}
        match={match}
        history={history}
      />
    </>
  );
}

export default TransplantForm;
