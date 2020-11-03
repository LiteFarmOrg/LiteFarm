/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (index.js) is part of LiteFarm.
 *
 *  LiteFarm is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  LiteFarm is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details, see <https://www.gnu.org/licenses/>.
 */

import React from 'react';
import { connect } from 'react-redux';
import { useMediaQuery } from 'react-responsive';
import styles from './../../components/Navigation/NavBar/styles.scss';
import SlideMenu from './slideMenu';
import SmallerLogo from '../../assets/images/smaller_logo.svg';
import SmallLogo from '../../assets/images/small_logo.svg';
import NoFarmNavBar from '../../components/Navigation/NoFarmNavBar'

import { farmSelector } from '../selector'
import PureNavBar from "../../components/Navigation/NavBar";

const NavBar = (props) => {
  const { auth, history, farm, steps } = props;
  console.log("we are in nav bar container...")
  console.log("steps is")
  console.log(steps)
  const { isAuthenticated } = auth;
  const isFarmSelected = isAuthenticated() && farm && farm.has_consent;
  const isSmallScreen = useMediaQuery({ query: '(max-width: 800px)' });
  const Logo = isSmallScreen ? (
      <img src={SmallerLogo} alt="Logo" className={styles.smallLogo} onClick={() => history.push('/')}/>)
    : (<img src={SmallLogo} alt="Logo" className={styles.smallLogo} onClick={() => history.push('/')}/>)

  const logout = () => {
    auth.logout();
  };

  if (!isFarmSelected) return <NoFarmNavBar history={history}/>

  return (
    <PureNavBar logo={Logo} steps={steps}>
      <SlideMenu right logout={logout}/>
    </PureNavBar>
  );
}

const mapStateToProps = (state) => {
  return {
    farm: farmSelector(state),
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(NavBar);
