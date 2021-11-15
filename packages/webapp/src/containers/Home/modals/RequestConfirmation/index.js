import React from 'react';
import { useDispatch } from 'react-redux';
import RequestConfirmationComponent from '../../../../components/Modals/RequestConfirmationModal';
import { dismissHelpRequestModal } from '../../homeSlice';

export default function RequestConfirmationModal() {
  const dispatch = useDispatch();

  const showRequestConfirmationModalOnClick = () => dispatch(dismissHelpRequestModal());

  return (
    <RequestConfirmationComponent
      onClick={showRequestConfirmationModalOnClick}
      dismissModal={showRequestConfirmationModalOnClick}
    />
  );
}
