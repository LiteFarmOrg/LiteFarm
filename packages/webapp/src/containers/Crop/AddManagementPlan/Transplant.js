import React from 'react';
import PureTransplant from '../../../components/Crop/Transplant';
import { cropVarietySelector } from '../../cropVarietySlice';
import { useSelector } from 'react-redux';
import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';

function TransplantForm({ history, match }) {
  const variety_id = match.params.variety_id;

  const variety = useSelector(cropVarietySelector(variety_id));

  const isCoverCrop = variety.can_be_cover_crop;

  return (
    <HookFormPersistProvider>
      <PureTransplant
        isCoverCrop={isCoverCrop}
        onGoBack={() => {
          history.push(`/crop/${variety_id}/add_management_plan/planted_already`);
        }}
        onCancel={() => {
          history.push(`/crop/${variety_id}/management`);
        }}
        match={match}
        history={history}
      />
    </HookFormPersistProvider>
  );
}

export default TransplantForm;
