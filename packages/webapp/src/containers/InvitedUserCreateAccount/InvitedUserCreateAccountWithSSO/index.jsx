import PropTypes from 'prop-types';

import PureInvitedUserCreateAccountPage from '../../../components/InvitedUserCreateAccount';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { acceptInvitationWithSSO } from '../saga';
import { useLocation } from 'react-router-dom';

export default function InvitedUserCreateAccountWithSSO() {
  let location = useLocation();
  const { t } = useTranslation(['translation', 'common']);
  const { google_id_token, invite_token, email, name, gender, birth_year } = location.state;
  const dispatch = useDispatch();
  const onSubmit = (data) => {
    dispatch(
      acceptInvitationWithSSO({
        google_id_token,
        invite_token,
        user: { ...data, email },
      }),
    );
  };
  return (
    <PureInvitedUserCreateAccountPage
      onSubmit={onSubmit}
      email={email}
      name={name}
      title={t('INVITATION.YOUR_INFORMATION')}
      buttonText={t('common:SAVE')}
      gender={gender}
      birthYear={birth_year}
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
};
