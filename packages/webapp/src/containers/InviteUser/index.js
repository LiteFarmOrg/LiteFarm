import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { getRoles } from './saga';
import history from '../../history';
import { showSpotlight } from '../actions';
import PureInviteUser from '../../components/InviteUser';
// import { certifierSurveySelector } from '../OrganicCertifierSurvey/slice';
import { getCertifiers } from '../OrganicCertifierSurvey/saga';
import { patchOutroStep } from './saga';
import { rolesSelector } from '../Profile/People/slice';
import { loginSelector } from '../userFarmSlice';

const generator = require('generate-password');
const { v4: uuidv4 } = require('uuid');

const dropDownMap = {
  1: "Farm Owner",
  2: "Farm Manager",
  3: "Farm Worker",
  5: "Extension Officer"
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
    const { role, email, wage: amount, first_name, last_name } = userInfo;
    console.log(userInfo);
    // Pseudo worker is a worker with no email filled out
    const isPseudo = role === 3 && email.trim().length === 0;
    // const amount = pay.amount && pay.amount.trim().length > 0 ? Number(pay.amount) : 0; // TODO: convert this to null to indicate no wage is entered
    if (!isPseudo) {
      const pw = generator.generate({
        length: 10,
        numbers: true,
        symbols: true,
      });
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
        password: pw,
      };
      console.log(pw, user);
      // this.props.dispatch(addUser(user));
      // alert('user created with password: ' + pw);
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
      };
      console.log(pseudoId, user);
      // this.props.dispatch(addPseudoWorker(user));
    }
    // dispatch(inviteUser());
    // setTimeout(() => {
    //   dispatch(showSpotlight(true));
    // }, 200);
  };

  useEffect(() => {
    // if (!survey.survey_id) {
    dispatch(getRoles());
    // }
  }, []);

  return <PureInviteUser onGoBack={onGoBack} onInvite={onInvite} roleOptions={roleOptions} />;
}

export default InviteUser;
