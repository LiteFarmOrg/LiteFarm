import React from 'react';
import PropTypes from 'prop-types';
import InvitedUserCreateAccountWithSSO from './InvitedUserCreateAccountWithSSO';
import InvitedUserCreateAccountWithLiteFarm from './InvitedUserCreateAccountWithLiteFarm';

export default function InvitedUserCreateAccount({ history }) {
  return !!history?.location?.state?.google_id_token ? (
    <InvitedUserCreateAccountWithSSO history={history} />
  ) : (
    <InvitedUserCreateAccountWithLiteFarm history={history} />
  );
}

InvitedUserCreateAccount.prototype = {
  history: PropTypes.object,
};
