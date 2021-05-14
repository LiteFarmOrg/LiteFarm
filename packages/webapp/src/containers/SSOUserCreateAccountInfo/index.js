import React from 'react';
import PropTypes from 'prop-types';
import PureInvitedUserCreateAccountPage from '../../components/InvitedUserCreateAccount';

import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { patchSSOUserInfo } from './saga';

export default function SSOUserCreateAccountInfo({ history }) {
  const { t } = useTranslation();
  const { user } = history.location.state;
  const { email, full_name: name } = user;
  const dispatch = useDispatch();
  const onSubmit = (data) => {
    dispatch(patchSSOUserInfo({ user: { ...data, email } }));
  };
  return (
    <PureInvitedUserCreateAccountPage
      onSubmit={onSubmit}
      email={email}
      name={name}
      title={t('INVITATION.YOUR_INFORMATION')}
      buttonText={t('common:SAVE')}
    />
  );
}

SSOUserCreateAccountInfo.prototype = {
  history: PropTypes.object,
};
