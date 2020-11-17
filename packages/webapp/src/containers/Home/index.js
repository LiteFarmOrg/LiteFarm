import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { getSeason } from './utils/season';
import { toastr } from 'react-redux-toastr';
import WeatherBoard from '../../containers/WeatherBoard';
import PureHome from '../../components/Home';
import { userFarmSelector } from '../userFarmSlice';

export default function Home() {
  const { userFarm } = useSelector(userFarmSelector);
  const imgUrl = getSeason(userFarm?.grid_points?.lat);
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
    detectBrowser();
  },[])



  return <PureHome title={`Good day, ${userFarm?.first_name}`}
                                 imgUrl={imgUrl}>
    {userFarm? <WeatherBoard lon={userFarm.grid_points.lng}
                                 lat={userFarm.grid_points.lat}
                                 lang={'en'}
                                 measurement={userFarm.units.measurement}/>: null}

  </PureHome>
}
