import React from 'react';
import PropTypes from 'prop-types';

import PureInvitedUserCreateAccountPage from '../../../components/InvitedUserCreateAccount';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { acceptInvitationWithLiteFarm } from '../saga';

export default function InvitedUserCreateAccountWithLiteFarm({ history }) {
  const { t } = useTranslation();
  const { invite_token, email, name, gender, birth_year } = history.location.state;
  const dispatch = useDispatch();
  const onSubmit = (data) => {
    dispatch(acceptInvitationWithLiteFarm({ invite_token, user: { ...data, email } }));
  };
  return (
    <PureInvitedUserCreateAccountPage
      onSubmit={onSubmit}
      email={email}
      name={name}
      title={t('INVITATION.CREATE_ACCOUNT')}
      buttonText={t('INVITATION.CREATE_NEW_ACCOUNT')}
      gender={gender}
      birthYear={birth_year}
      isNotSSO
    />
  );
}

InvitedUserCreateAccountWithLiteFarm.prototype = {
  history: PropTypes.object,
};
