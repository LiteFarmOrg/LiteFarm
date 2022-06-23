import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { patchUserFarmStatus, validateResetToken } from './saga';
import Spinner from '../../components/Spinner';

function Callback({ history }) {
  const dispatch = useDispatch();
  useEffect(() => {
    const params = new URLSearchParams(history.location.search.substring(1));
    const isResetLink = params.has('reset_token');
    const isInviteLink = params.has('invite_token');
    if (isResetLink) {
      dispatch(validateResetToken({ reset_token: params.get('reset_token') }));
    } else if (isInviteLink) {
      dispatch(
        patchUserFarmStatus({
          invite_token: params.get('invite_token'),
          language: params.get('language'),
        }),
      );
    } else {
      history.push('/');
    }
  }, []);

  return <Spinner />;
}

export default Callback;
