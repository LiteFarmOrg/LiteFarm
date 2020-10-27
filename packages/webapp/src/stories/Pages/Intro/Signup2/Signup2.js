import Layout from '../components/Layout';
import signup2 from '../../../assets/signUp/signUp2.svg';
import PropTypes from 'prop-types';
import Button from '../../../Button';
import React from 'react';
import Svg from '../components/Svg';
import history from '../../../../history';

export function PureSignup2({ onClick }) {
  return <Layout isSVG buttonGroup={<Button onClick={onClick} fullLength>Let's get started</Button>}>
    <Svg svg={signup2} alt={'Welcome to LiteFarm'}/>
  </Layout>
}

PureSignup2.prototype = {
  onClick: PropTypes.func,
}

export default function Signup2() {
  const onClick = () => {
    history.push('./add_farm');
  }
  return <PureSignup2 onClick={onClick}/>
}