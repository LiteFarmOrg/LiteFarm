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
import logo from '../../assets/images/logo2x.png';
import picOne from '../../assets/images/introSliders/0.png';
import picTwo from '../../assets/images/introSliders/1.png';
import picThree from '../../assets/images/introSliders/2.png';
import picFour from '../../assets/images/introSliders/5.png';
import picFive from '../../assets/images/introSliders/6.png';
import LoginButton from './loginButton';
import styles from './styles.scss';
import { useTranslation } from "react-i18next";
import Carousel from 'nuka-carousel';

const slides = [
    {
    header: 'Sustainability Reporting',
    info: 'The world\'s first app that helps you manage your business, social, and environmental impacts at the same time',
    img: picOne
    },
    {
    header: 'Real-Time Costing',
    info: 'Our unique finances feature allows you to track cost of production by crops in real-time —  so you can make smart decisions within season.',
    img: picTwo
    },
    {
    header: 'Field Design made easy',
    info: 'Our easy to use mapping tool allow you to design and plan your crops for the coming season',
    img: picThree
    },
    {
    header: 'Reliable File Storage',
    info: 'Our simple to use filing system makes retrieving your farm records simple and intuitive.',
    img: picFour
    },
    {
    header: 'Customize it the way you want it',
    info: 'Every operation is different.  You can customize your application so it fits your farm, your team, your way.',
    img: picFive
    }
];


function Login() {
    const { t, i18n} = useTranslation();
    return (
      <div className={styles.home} >
          <div className={styles.lander}>
              <div className={styles.textColor}>
                  <Carousel wrapAround withoutControls transitionMode='fade'>
                      <div style={{ height: '50vh' }}>
                          <img className={styles.logo} src={logo} alt={t('common:NOT_FOUND')}/>
                          <h4 className={styles.bodyText}>{t('LOGIN.TITLE')}</h4>
                      </div>
                      {slides.map((slide, index) => {
                          return (<div key={'slide-' + index}>
                              <h2>{slide.header}</h2>
                              <h4 className={styles.bodyText}>{slide.info}</h4>
                              <img className={styles.otherPhotos} src={slide.img} alt={t('common:NOT_FOUND')} />
                          </div>)
                      })}
                  </Carousel>
              </div>
              <LoginButton />
          </div>
      </div>
    )
}

export default Login;
