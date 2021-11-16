import React, { useEffect, useState } from 'react';
import PureInviteSignup from '../../components/InviteSignup';
import jwt from 'jsonwebtoken';
import { useTranslation } from 'react-i18next';
import GoogleLogin from 'react-google-login';

import Button from '../../components/Form/Button';
import { isChrome } from '../../util';

function InviteSignUp({ history }) {
  const invite_token = history.location.state;
  const GOOGLE = 1;
  const LITEFARM = 2;
  const [selectedKey, setSelectedKey] = useState(0);
  const { i18n, t } = useTranslation(['translation', 'common']);
  const [email, setEmail] = useState();
  const [gender, setGender] = useState();
  const [birth_year, setBirthYear] = useState();
  const [showError, setShowError] = useState();
  useEffect(() => {
    if (!invite_token) {
      history.push('/');
    } else {
      const { email, gender, birth_year } = getTokenContent(invite_token);
      setEmail(email);
      setGender(gender);
      setBirthYear(birth_year);
    }
  }, []);

  function getTokenContent(token) {
    const decoded = jwt.decode(token);
    return decoded;
  }

  const onClick = (selectedKey) => {
    setSelectedKey(selectedKey);
  };

  const onSuccessGoogle = (res) => {
    if (res.profileObj.email === email) {
      history.push('/accept_invitation/create_account', {
        email,
        google_id_token: res.tokenObj.id_token,
        invite_token,
        name: res.profileObj.name,
        gender,
        birth_year,
      });
    } else {
      setShowError(true);
    }
  };
  const onFailureGoogle = (res) => {
    console.log(res);
  };
  const onClickGoogle = (renderProps) => () => {
    if (selectedKey === GOOGLE) {
      renderProps.onClick();
    } else {
      const { email, first_name, last_name } = getTokenContent(invite_token);
      history.push('/accept_invitation/create_account', {
        invite_token,
        email,
        name: `${first_name} ${last_name}`,
        gender,
        birth_year,
      });
    }
  };
  const clientId = process.env.REACT_APP_GOOGLE_OAUTH_CLIENT_ID;

  return (
    <>
      <PureInviteSignup
        googleButton={
          <GoogleLogin
            render={(renderProps) => (
              <Button
                onClick={onClickGoogle(renderProps)}
                disabled={(selectedKey === GOOGLE && renderProps.disabled) || !selectedKey}
                fullLength
              >
                {t('common:PROCEED')}
              </Button>
            )}
            onSuccess={onSuccessGoogle}
            onFailure={onFailureGoogle}
            clientId={clientId}
          >
            {t('SIGNUP.GOOGLE_BUTTON')}
          </GoogleLogin>
        }
        showError={showError}
        selectedKey={selectedKey}
        email={email}
        onClick={onClick}
        isChrome={isChrome()}
      />
    </>
  );
}

export default InviteSignUp;
