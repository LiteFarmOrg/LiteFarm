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

import React, {Component} from "react";
import {connect} from 'react-redux';
import styles from "./styles.scss";
import Auth from '../../Auth/Auth';
import {getUserInfo} from '../actions';
import {userInfoSelector, farmSelector} from '../selector';
import moment from 'moment';
import backGround0 from '../../assets/images/backgrounds/0.jpg';
import backGround1 from '../../assets/images/backgrounds/1.jpg';
import backGround2 from '../../assets/images/backgrounds/2.jpg';
import backGround3 from '../../assets/images/backgrounds/3.jpg';
import backGround4 from '../../assets/images/backgrounds/4.jpg';
import backGround5 from '../../assets/images/backgrounds/5.jpg';
import {toastr} from 'react-redux-toastr';
import {Alert} from 'react-bootstrap';
import ReactWeather from '../../components/ReactOpenWeather/js/components/ReactWeather';
import apiConfig from '../../apiConfig';

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      backGroundImage: undefined,
      greeting: '',
      lat: null,
      lon: null,
      hasLocation: false
    };

    this.getGreetingTime = this.getGreetingTime.bind(this);
    this.getLocation = this.getLocation.bind(this);
    this.setPosition = this.setPosition.bind(this);
    this.detectBrowser = this.detectBrowser.bind(this);

  }

  getGreetingTime = () => {
    const currentTime = moment();
    const splitAfternoon = 12; // 24hr time to split the afternoon
    const splitEvening = 17; // 24hr time to split the evening
    const currentHour = parseFloat(currentTime.format('HH'));
    let greeting;
    if (currentHour >= splitAfternoon && currentHour <= splitEvening) {
      // Between 12 PM and 5PM
      greeting = 'Good Afternoon';
    } else if (currentHour >= splitEvening) {
      // Between 5PM and Midnight
      greeting = 'Good Evening';
    }
    // Between dawn and noon
    else greeting = 'Good Morning';

    this.setState({greeting});
  };

  getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(this.setPosition);
    }
  }

  setPosition(position) {
    //console.log(typeof position.coords.latitude);
    this.setState({
      lat: String(position.coords.latitude),
      lon: String(position.coords.longitude),
      hasLocation: true,
    });
  }

  detectBrowser() {
    // ripped off stackoverflow: https://stackoverflow.com/questions/4565112/javascript-how-to-find-out-if-the-user-browser-is-chrome
    const isChromium = window.chrome;
    const winNav = window.navigator;
    const vendorName = winNav.vendor;
    const isOpera = typeof window.opr !== "undefined";
    const isIEedge = winNav.userAgent.indexOf("Edge") > -1;
    const isIOSChrome = winNav.userAgent.match("CriOS");

    if (isIOSChrome) {
      // is Google Chrome on IOS
    } else if(
      isChromium !== null &&
      typeof isChromium !== "undefined" &&
      vendorName === "Google Inc." &&
      isOpera === false &&
      isIEedge === false
    ) {
      // is Google Chrome
    } else {
      toastr.warning('Warning: The app is designed for Chrome, some layouts could be misplaced.')
      // not Google Chrome
    }
  }

  componentDidMount() {
    // trying to make a random background thing
    const auth = new Auth();
    const backGroundArr = [backGround0, backGround1, backGround2, backGround3, backGround4, backGround5];
    const numberOfBackgrounds = 6;
    let imageIndex = Math.floor(Math.random() * numberOfBackgrounds);
    this.setState({backGroundImage: backGroundArr[imageIndex]});
    if (auth.isAuthenticated()) {
      this.props.dispatch(getUserInfo(true));
      this.getGreetingTime();
      this.detectBrowser();
    }
  }

  render() {
    let backGround = {
      backgroundImage: `url(${this.state.backGroundImage})`,
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      height: '100vh',
    };
    const {greeting} = this.state;
    const {userInfo, farm} = this.props;

    return(<div className={styles.home} style={backGround}>
      <div className={styles.lander}>
        <div>
          <div className={styles.greetContainer}>
            <div><h1>{greeting}</h1> {
              userInfo && <h1>{userInfo.first_name}</h1>
            }</div>
            {
              farm && farm.grid_points && farm.grid_points.lat && farm.grid_points.lng && <div>
                <ReactWeather
                  forecast="today"
                  apikey={apiConfig.weatherAPIKey}
                  type="geo"
                  lat={farm.grid_points.lat.toString()}
                  lon={farm.grid_points.lng.toString()}
                />
              </div>
            }
            {
              farm && !farm.grid_points &&<div className={styles.weatherMsg}>
                <Alert variant="warning">
                  Enter your farm address in Profile/Farm to enable weather info.
                </Alert>
              </div>
            }
          </div>
        </div>
      </div>
    </div>)
  };
}


const mapStateToProps = (state) => {
  return {
    userInfo: userInfoSelector(state),
    farm: farmSelector(state),
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(Home);
