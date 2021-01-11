import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { validateResetToken, patchUserFarmStatus } from './saga';
import PureCallback from '../../components/Callback';

function Callback({ history }) {
  const dispatch = useDispatch();
  useEffect(() => {
    const params = new URLSearchParams(history.location.search.substring(1));
    const isResetLink = params.has('reset_token');
    const isInviteLink = params.has('invite_token');
    if (isResetLink) {
      dispatch(validateResetToken({ reset_token: params.get('reset_token') }));
    } else if (isInviteLink) {
      dispatch(patchUserFarmStatus({ invitation_token: params.get('invite_token') }));
    } else {
      history.push('/');
    }
  }, []);

  return <PureCallback />;
}

export default Callback;
