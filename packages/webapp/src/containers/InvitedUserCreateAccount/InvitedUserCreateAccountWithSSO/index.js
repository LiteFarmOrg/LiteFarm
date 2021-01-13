import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import PureInvitedUserCreateAccountPage from '../../../components/InvitedUserCreateAccount';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { acceptInvitationWithSSO } from '../saga';

export default function InvitedUserCreateAccountWithSSO({ history }) {
  const { t } = useTranslation();
  const { google_id_token, invite_token, email, name } = history.location.state;
  const dispatch = useDispatch();
  const onSubmit = (data) => {
    dispatch(acceptInvitationWithSSO({ google_id_token, invite_token, user: { ...data, email } }));
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

InvitedUserCreateAccountWithSSO.prototype = {
  onSubmit: PropTypes.func,
  email: PropTypes.string,
  name: PropTypes.string,
  title: PropTypes.string,
  isNotSSO: PropTypes.bool,
  buttonText: PropTypes.string,
  history: PropTypes.object,
};
