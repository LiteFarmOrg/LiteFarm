import PureInvitedUserCreateAccountPage from '../../../components/InvitedUserCreateAccount';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { acceptInvitationWithLiteFarm } from '../saga';
import { useLocation } from 'react-router-dom';

export default function InvitedUserCreateAccountWithLiteFarm() {
  let location = useLocation();
  const { t } = useTranslation();
  const { invite_token, email, name, gender, birth_year } = location.state;
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
