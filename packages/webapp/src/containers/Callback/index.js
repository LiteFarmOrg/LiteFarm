import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { validateToken } from './saga';
import PureCallback from '../../components/Callback';

function Callback({ history }) {
  const dispatch = useDispatch();
  const params = new URLSearchParams(history.location.search.substring(1));
  const isResetLink = params.has('reset_token');
  // const isInviteLink = params.has('invite_token');
  let token;
  let tokenType;
  if (isResetLink) {
    token = params.get('reset_token');
    tokenType = 'reset';
  } else {
    token = params.get('invite_token');
    tokenType = 'invite';
  }
  const [isValid, setIsValid] = useState(undefined);

  useEffect(() => {
    dispatch(validateToken({ token, tokenType, setIsValid }));
  }, []);

  return (<PureCallback/>);
}

export default Callback;
