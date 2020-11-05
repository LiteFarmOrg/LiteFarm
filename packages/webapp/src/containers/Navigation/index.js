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

  const farmSpotlight = "Here you can:, • Edit your farm settings, • Map your farm, • Manage your employees";
  const notificationsSpotlight = "Here you can:, • Manage your tasks, • See important updates, • Coordinate farm activities";
  const myProfileSpotlight = "Here you will find:, • Your info, • Helpful tips, • The log out button";

  const returnContent = (spotlightType) => {
    return spotlightType.split(',').map(function(item, key) {
      return (
        <span key={key}>
        <p align="left">{item}</p>
        </span>
      )
    })
  }

  const state = {
    steps: [
      {
        target: "#firstStep",
        title: "This is your farm profile",
        content: returnContent(farmSpotlight),
      },
      {
        target: "#secondStep",
        title: "This is your Notification Centre",
        content: returnContent(notificationsSpotlight),
      },
      {
        target: "#thirdStep",
        title: "This is your profile",
        content: returnContent(myProfileSpotlight),
      },
      
    ]
  }

  return (
    <PureNavBar logo={Logo} steps={state.steps}>
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
