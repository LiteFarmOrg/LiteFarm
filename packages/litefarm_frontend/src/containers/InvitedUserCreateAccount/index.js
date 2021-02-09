import React from 'react';
import PropTypes from 'prop-types';
import InvitedUserCreateAccountWithSSO from './InvitedUserCreateAccountWithSSO';
import InvitedUserCreateAccountWithLiteFarm from './InvitedUserCreateAccountWithLiteFarm';

export default function InvitedUserCreateAccount({ history }) {
  const { google_id_token } = history.location.state;
  return google_id_token ? (
    <InvitedUserCreateAccountWithSSO history={history} />
  ) : (
    <InvitedUserCreateAccountWithLiteFarm history={history} />
  );
}

InvitedUserCreateAccount.prototype = {
  history: PropTypes.object,
};
