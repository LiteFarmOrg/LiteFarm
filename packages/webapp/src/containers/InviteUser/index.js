import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { getRoles, inviteUserToFarm, addPseudoWorker } from './saga';
import history from '../../history';
import PureInviteUser from '../../components/InviteUser';
import { rolesSelector } from '../Profile/People/slice';
import { loginSelector } from '../userFarmSlice';

import i18n from '../../lang/i18n';

const { v4: uuidv4 } = require('uuid');

const dropDownMap = {
  1: i18n.t('role:OWNER'),
  2: i18n.t('role:MANAGER'),
  3: i18n.t('role:WORKER'),
  5: i18n.t('role:EXTENSION_OFFICER'),
}

function InviteUser() {
  const dispatch = useDispatch();
  const roles = useSelector(rolesSelector);
  const roleOptions = roles.map(({role_id}) => ({ value: role_id, label: dropDownMap[role_id]}));
  const { farm_id } = useSelector(loginSelector);
  const onGoBack = () => {
    history.push({
      pathname: '/Profile',
      state: 'people',
    });
  };

  const onInvite = (userInfo) => {
    const { role, email, wage: amount, first_name, last_name, gender, birth_year, phone_number } = userInfo;
    console.log(userInfo);
    // Pseudo worker is a worker with no email filled out
    const isPseudo = role === 3 && email.trim().length === 0;
    // const amount = pay.amount && pay.amount.trim().length > 0 ? Number(pay.amount) : 0; // TODO: convert this to null to indicate no wage is entered
    if (!isPseudo) {
      const user = {
        email,
        first_name,
        last_name,
        farm_id,
        role_id: Number(role),
        wage: {
          type: 'hourly',
          amount,
        },
        gender,
        birth_year,
        phone_number,
      };
      !user.birth_year && delete user.birth_year;
      !user.phone_number && delete user.phone_number;

      dispatch(inviteUserToFarm(user));
    } else {
      const pseudoId = uuidv4();
      const user = {
        email: pseudoId + '@pseudo.com',
        first_name,
        last_name,
        farm_id,
        wage: {
          type: 'hourly',
          amount,
        },
        profile_picture: 'https://cdn.auth0.com/avatars/na.png',
        user_id: pseudoId,
        gender,
        birth_year,
        phone_number,
      };
      !user.birth_year && delete user.birth_year;
      !user.phone_number && delete user.phone_number;

      dispatch(addPseudoWorker(user));
    }
    
    history.push({
      pathname: '/Profile',
      state: 'people',
    });
  };

  useEffect(() => {
    dispatch(getRoles());
  }, []);

  return <PureInviteUser onGoBack={onGoBack} onInvite={onInvite} roleOptions={roleOptions} />;
}

export default InviteUser;
