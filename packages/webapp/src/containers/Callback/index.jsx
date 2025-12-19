import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { patchUserFarmStatus, validateResetToken } from './saga';
import Spinner from '../../components/Spinner';

function Callback() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  useEffect(() => {
    // TODO: test if URLSearchParams works the same way as before
    const params = new URLSearchParams(location.search.substring(1));
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
