import Layout from './Layout';
import signup2 from '../../assets/signUp/signUp2.svg';
import PropTypes from 'prop-types';
import Button from '../../Button';
import React from 'react';
import Svg from './Svg';
import {useRouter} from 'react-router-dom';

export function PureSignup2({ onClick }){
  return <Layout buttonGroup={<Button onClick={onClick} fullLength/>}>
    <Svg svg={signup2} alt={'Welcome to LiteFarm'}/>
  </Layout>
}
PureSignup2.prototype={
  onClick: PropTypes.func,
}

export default function Signup2(){

}