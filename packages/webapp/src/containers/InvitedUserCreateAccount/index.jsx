import InvitedUserCreateAccountWithSSO from './InvitedUserCreateAccountWithSSO';
import InvitedUserCreateAccountWithLiteFarm from './InvitedUserCreateAccountWithLiteFarm';
import { useLocation } from 'react-router-dom-v5-compat';

export default function InvitedUserCreateAccount() {
  let location = useLocation();
  return location?.state?.google_id_token ? (
    <InvitedUserCreateAccountWithSSO />
  ) : (
    <InvitedUserCreateAccountWithLiteFarm />
  );
}
