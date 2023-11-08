import React from 'react';
import PropTypes from 'prop-types';
import PureCreateUserAccount from '../../components/CreateUserAccount';

import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { patchSSOUserInfo } from './saga';

export default function SSOUserCreateAccountInfo({ history }) {
  const { t } = useTranslation();
  const { user } = history.location.state;
  const { email, full_name: name } = user;
  const dispatch = useDispatch();

  const onSignUp = ({ language, ...otherFormData }) => {
    dispatch(
      patchSSOUserInfo({ user: { ...otherFormData, language_preference: language, email } }),
    );
  };

  const onGoBack = () => {
    //  TODO LF-3798: Going back (including with browser back button) will not work in this flow as the SSO user account was already created at the point of interacting with the Google Login button
  };

  return (
    <PureCreateUserAccount
      onSignUp={onSignUp}
      email={email}
      name={name}
      title={t('INVITATION.YOUR_INFORMATION')}
      buttonText={t('common:SAVE')}
      isNotSSO={false}
      onGoBack={onGoBack}
    />
  );
}

SSOUserCreateAccountInfo.prototype = {
  history: PropTypes.object,
};
