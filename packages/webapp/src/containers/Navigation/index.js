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
import styles1 from './styles1.scss'

import { farmSelector, spotlightSelector } from '../selector'
import PureNavBar from "../../components/Navigation/NavBar";

import { showSpotlight } from "../actions";

const NavBar = (props) => {
  const { auth, history, farm, show_spotlight, dispatch } = props;

  const { isAuthenticated } = auth;
  const isFarmSelected = isAuthenticated() && farm && farm.has_consent && farm?.step_five === true;
  const isSmallScreen = useMediaQuery({ query: '(max-width: 800px)' });
  const Logo = isSmallScreen ? (
      <img src={SmallerLogo} alt="Logo" className={styles.smallLogo} onClick={() => history.push('/')}/>)
    : (<img src={SmallLogo} alt="Logo" className={styles.smallLogo} onClick={() => history.push('/')}/>)

  const farmSpotlight = "Here you can:, • Edit your farm settings, • Map your farm, • Manage your employees";
  const notificationsSpotlight = "Here you can:, • Manage your tasks, • See important updates, • Coordinate farm activities";
  const myProfileSpotlight = "Here you will find:, • Your info, • Helpful tips, • The log out button";

  const returnContent = (spotlightType, title) => {
    return spotlightType.split(',').map(function(item, key) {
      return (
        title ? 
        <span key={key} className={styles1.green}>
        <p align="left">{item}</p>
        </span> :
        <span key={key}><p align="left">{item}</p></span>
      )
    })
  }

  const returnNextButton = (str) => {
    return (
      <span className={styles1.black}>{str}</span>
    )
  }

  const steps = [
      {
        target: "#firstStep",
        title: returnContent("This is your farm profile", true),
        content: returnContent(farmSpotlight, false),
        locale: {
          next: returnNextButton("Next"),
        },
        placement: "bottom-start",
        showCloseButton: false,
        disableBeacon: true,
      },
      {
        target: "#secondStep",
        title: returnContent("This is your Notification Centre", true),
        content: returnContent(notificationsSpotlight, false),
        locale: {
          next: returnNextButton("Next"),
        },
        placement: "bottom-start",
        showCloseButton: false
      },
      {
        target: "#thirdStep",
        title: returnContent("This is your profile", true),
        content: returnContent(myProfileSpotlight, false),
        locale: {
          last: returnNextButton("Got it"),
        },
        placement: "left-start",
        showCloseButton: false,

      },

    ]


  if (!isFarmSelected) return <NoFarmNavBar history={history}/>

  const resetSpotlight = () => {
    dispatch(showSpotlight(false))
  }

return (
    <PureNavBar logo={Logo} steps={show_spotlight && steps} resetSpotlight={resetSpotlight} auth={auth}>
      <SlideMenu right />
    </PureNavBar>
  );


}

const mapStateToProps = (state) => {
  return {
    farm: farmSelector(state),
    show_spotlight: spotlightSelector(state)
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(NavBar);
