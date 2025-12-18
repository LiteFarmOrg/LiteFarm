import React, { useEffect } from 'react';
import { useHistory, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { patchUserFarmStatus, validateResetToken } from './saga';
import Spinner from '../../components/Spinner';

function Callback() {
  const navigate = useNavigate();
  const history = useHistory();
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
      navigate('/');
    }
  }, []);

  return <Spinner />;
}

export default Callback;
