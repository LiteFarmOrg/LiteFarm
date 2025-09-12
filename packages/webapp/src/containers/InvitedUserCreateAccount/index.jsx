import { useLocation } from 'react-router-dom';
import InvitedUserCreateAccountWithSSO from './InvitedUserCreateAccountWithSSO';
import InvitedUserCreateAccountWithLiteFarm from './InvitedUserCreateAccountWithLiteFarm';

export default function InvitedUserCreateAccount() {
  const location = useLocation();
  return location?.state?.google_id_token ? (
    <InvitedUserCreateAccountWithSSO />
  ) : (
    <InvitedUserCreateAccountWithLiteFarm />
  );
}
