import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getSeason } from './utils/season';
import { toastr } from 'react-redux-toastr';
import WeatherBoard from '../../containers/WeatherBoard';
import PureHome from '../../components/Home';
import { userFarmSelector } from '../userFarmSlice';
import {useTranslation} from "react-i18next";
import FarmSwitchOutro from '../FarmSwitchOutro';
import history from '../../history';

export default function Home() {
  const { t } = useTranslation();
  const userFarm = useSelector(userFarmSelector);
  const imgUrl = getSeason(userFarm?.grid_points?.lat);
  const detectBrowser = () => {
    // ripped off stackoverflow: https://stackoverflow.com/questions/4565112/javascript-how-to-find-out-if-the-user-browser-is-chrome
    const isChromium = window.chrome;
    const winNav = window.navigator;
    const vendorName = winNav.vendor;
    const isOpera = typeof window.opr !== 'undefined';
    const isIEedge = winNav.userAgent.indexOf('Edge') > -1;
    const isIOSChrome = winNav.userAgent.match('CriOS');

    if (isIOSChrome) {
      // is Google Chrome on IOS
    } else if (
      isChromium !== null &&
      typeof isChromium !== 'undefined' &&
      vendorName === 'Google Inc.' &&
      isOpera === false &&
      isIEedge === false
    ) {
      // is Google Chrome
    } else {
      toastr.warning(t('HOME.CHROME_WARNING'))
      // not Google Chrome
    }
  }
  useEffect(() => {
    detectBrowser();
  }, []);

  const [switchFarm, setSwitchFarm] = useState(history.location.state);
  const dismissPopup = () => setSwitchFarm(false);

  return <PureHome title={`${t('HOME.GREETING')}, ${userFarm?.first_name}`}
                                 imgUrl={imgUrl}>
    {userFarm? <WeatherBoard lon={userFarm.grid_points.lng}
                                 lat={userFarm.grid_points.lat}
                                 lang={'en'}
                                 measurement={userFarm.units.measurement}/>: null}
    {switchFarm && <FarmSwitchOutro onFinish={dismissPopup}/>}

    {
      switchFarm &&
      <div onClick={dismissPopup} style={{
        position: 'fixed',
        zIndex: 100,
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        backgroundColor: 'rgba(25, 25, 40, 0.8)',
      }}/>
    }

  </PureHome>
}
