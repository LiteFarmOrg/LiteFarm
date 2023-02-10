import React, { useEffect, useState } from 'react';
import PureInviteSignup from '../../components/InviteSignup';
import jwt from '@tsndr/cloudflare-worker-jwt';
import { useTranslation } from 'react-i18next';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';

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

  const onSuccessGoogle = (data, token) => {
    if (data.email === email) {
      history.push('/accept_invitation/create_account', {
        email,
        google_id_token: token.access_token, // not equivalent to an id token; on the backend we will use google-auth-library's tokenInfo() rather than verifyIdToken() on it
        invite_token,
        name: data.name,
        gender,
        birth_year,
        isAccessToken: true, // to let the backend know how to process this
      });
    } else {
      setShowError(true);
    }
  };

  const onFailureGoogle = (res) => {
    console.log(res);
  };

  const onClickProceed = (renderProps) => () => {
    if (selectedKey === GOOGLE) {
      renderProps.onClick();
      login();
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

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        // I have not previously used redux or redux-saga, but I imagine a query to an API like this should be in a saga.js file?
        const userInfo = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        onSuccessGoogle(userInfo.data, tokenResponse);
      } catch (error) {
        console.log(error);
      }
    },
    onError: (errorResponse) => console.log(errorResponse),
  });

  /* Shape of response object from hook:

      { 
        access_token: ...,
        authuser: "2",
        expires_in: 3599
        prompt: "none",
        scope: "email profile ...",
        token_type: "Bearer"
      }


    Shape of response from https://www.googleapis.com/oauth2/v3/userinfo using the access_token above:

      { 
        email: ...
        email_verified: true,
        family_name: ...
        given_name: ...
        locale: ...,
        name: ...
        picture: <link>
        sub: ...
      }

  */

  /* ProceedButton is a wrapper for the renderProps that handles the onClick similar to how the previous package's GoogleLogin component did: https://github.com/anthonyjgrove/react-google-login/blob/master/src/google-login.js I wrote it like this in order to keep the surrounding code unchanged. I don't really use/understand renderProps myself so I will defer to someone else if maybe they can be refactored out, now that our new package doesn't require them. */
  const ProceedButton = ({ render }) => {
    return render({ onClick });
  };

  return (
    <PureInviteSignup
      googleButton={
        <ProceedButton
          render={(renderProps) => (
            <Button
              data-cy="invitedUser-proceed"
              onClick={onClickProceed(renderProps)}
              disabled={(selectedKey === GOOGLE && renderProps.disabled) || !selectedKey}
              fullLength
            >
              {t('common:PROCEED')}
            </Button>
          )}
        />
      }
      showError={showError}
      selectedKey={selectedKey}
      email={email}
      onClick={onClick}
      isChrome={isChrome()}
    />
  );
}

export default InviteSignUp;
