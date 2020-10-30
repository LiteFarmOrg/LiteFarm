import React, { useEffect } from 'react';
import Auth from '../../Auth/Auth';
import { useDispatch, useSelector } from "react-redux";
import { farmSelector, userInfoSelector } from "../selector";
import { getSeason } from "./utils/season";
import { toastr } from "react-redux-toastr";
import { getUserInfo } from "../actions";
import WeatherBoard from "../../stories/WeatherBoard";
//TODO delete this wrapper once auth0 bug is fixed
export default function Home() {
  const auth = new Auth();
  const farm = useSelector(farmSelector);
  const user = useSelector(userInfoSelector);
  const dispatch = useDispatch();
  const imgUrl = getSeason(farm?.grid_points?.lat);
  const detectBrowser = () => {
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
  useEffect(()=>{
    if (auth.isAuthenticated()) {
      dispatch(getUserInfo(true));
      detectBrowser();
    }
  })



  return farm && user? <PureHome title={`Good morning, ${user.first_name}`}
                                 imgUrl={imgUrl}>
    <WeatherBoard lon={farm.grid_points.lng}
                  lat={farm.grid_points.lat}
                  lang={'en'}
                  measurement={farm.units.measurement}/>
  </PureHome>:null
}
