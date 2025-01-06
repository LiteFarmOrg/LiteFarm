import InvitedUserCreateAccountWithSSO from './InvitedUserCreateAccountWithSSO';
import InvitedUserCreateAccountWithLiteFarm from './InvitedUserCreateAccountWithLiteFarm';
import { useLocation } from 'react-router-dom-v5-compat';

export default function InvitedUserCreateAccount({ setAuth }) {
  let location = useLocation();
  return location?.state?.google_id_token ? (
    <InvitedUserCreateAccountWithSSO setAuth={setAuth} />
  ) : (
    <InvitedUserCreateAccountWithLiteFarm setAuth={setAuth} />
  );
}
