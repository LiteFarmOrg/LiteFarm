import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { patchUserFarmStatus, validateResetToken } from './saga';
import Spinner from '../../components/Spinner';
import { useLocation, useNavigate } from 'react-router';

function Callback({ setAuth }) {
  let navigate = useNavigate();
  let location = useLocation();
  const dispatch = useDispatch();
  useEffect(() => {
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
          setAuth,
        }),
      );
    } else {
      navigate('/');
    }
  }, []);

  return <Spinner />;
}

export default Callback;
