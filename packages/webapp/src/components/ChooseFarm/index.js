import Layout from '../Layout';
import Button from '../Form/Button';

import React from 'react';
import PropTypes from 'prop-types';
import { Title, Underlined } from '../Typography';
import { Link } from 'react-router-dom';
import ChooseFarmMenuItem from './ChooseFarmMenu/ChooseFarmMenuItem';
import Input from '../Form/Input';


export default function PureChooseFarmScreen({ onClick, farms = [], isSearchable, isOnBoarding, ...props }) {
  return <Layout buttonGroup={<Button onClick={onClick} fullLength>Let's get started</Button>}>
    <Title style={{marginBottom: '16px'}}>Choose your farm</Title>
    <Link style={{marginBottom: '16px'}} to={'/add_farm'}>+ <Underlined>Add new farm</Underlined></Link>
    {isSearchable && <Input style={{marginBottom: '16px'}} placeholder={'Search'} isSearchBar={true} {...props}/>}
    {farms.map((farm) => {
      return <ChooseFarmMenuItem style={{marginBottom: '16px'}} farmName={farm.name} address={farm.address} color={farm.color} onClick={onClick}
                                 coordinate={farm.coordinate} ownerName={farm.ownerName}/>
    })}
  </Layout>
}

PureChooseFarmScreen.prototype = {
  isSearchable: PropTypes.bool,
  farms: PropTypes.array,
  onClick: PropTypes.func,
  isOnBoarding: PropTypes.bool
}
