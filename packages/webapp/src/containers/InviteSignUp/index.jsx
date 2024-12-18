import { useEffect, useState } from 'react';
import PureInviteSignup from '../../components/InviteSignup';
import { decodeToken } from 'react-jwt';
import { useTranslation } from 'react-i18next';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';

import Button from '../../components/Form/Button';
import { isChrome } from '../../util';
import { useLocation, useNavigate } from 'react-router';

function InviteSignUp() {
  let navigate = useNavigate();
  let location = useLocation();
  const invite_token = location.state;
  const GOOGLE = 1;
  const [selectedKey, setSelectedKey] = useState(0);
  const { i18n, t } = useTranslation(['translation', 'common']);
  const [email, setEmail] = useState();
  const [gender, setGender] = useState();
  const [birth_year, setBirthYear] = useState();
  const [showError, setShowError] = useState();
  useEffect(() => {
    if (!invite_token) {
      navigate('/');
    } else {
      const { email, gender, birth_year } = getTokenContent(invite_token);
      setEmail(email);
      setGender(gender);
      setBirthYear(birth_year);
    }
  }, []);

  function getTokenContent(token) {
    const decoded = decodeToken(token);
    return decoded;
  }

  const onClick = (selectedKey) => {
    setSelectedKey(selectedKey);
  };

  const onSuccessGoogle = (data, token) => {
    if (data.email === email) {
      navigate('/accept_invitation/create_account', {
        state: {
          email,
          google_id_token: token.access_token,
          invite_token,
          name: data.name,
          gender,
          birth_year,
        },
      });
    } else {
      setShowError(true);
    }
  };

  const onClickProceed = () => {
    if (selectedKey === GOOGLE) {
      login();
    } else {
      const { email, first_name, last_name } = getTokenContent(invite_token);
      navigate('/accept_invitation/create_account', {
        state: {
          invite_token,
          email,
          name: `${first_name} ${last_name}`,
          gender,
          birth_year,
        },
      });
    }
  };

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
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

  return (
    <PureInviteSignup
      googleButton={
        <Button
          data-cy="invitedUser-proceed"
          onClick={onClickProceed}
          disabled={!selectedKey}
          fullLength
        >
          {t('common:PROCEED')}
        </Button>
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
