import React, {useEffect, useRef, useState} from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import OpenWeatherApi from '../../../components/ReactOpenWeather/js/OpenWeatherApi';
import { WeatherBoard } from './WeatherBoard';
/**
 * TooShort UI component for user interaction
 */
export const Weather = ({
  unit="metric",
  forecast="today",
  lang="en",
  apikey="35fbcd218f9c8b7eb129d6bd44e97dd4",
  lat="50.4406593",
  lon="-5.0413541",
  type="geo",
  city='Vancouver',
  ...props
}) => {
  const api = useRef(new OpenWeatherApi(unit, apikey, lang));
  const [resData, setResData] = useState();

  const _getParams = () => {
    switch (type) {
    case 'city':
      return { q: city, lang };
    case 'geo':
      return {
        lat,
        lon,
        lang,
      };
    default:
      return {
        q: 'auto:ip',
        lang,
      };
    }
  }

  const getForecastData = ()=> {
    const params = _getParams();
    let promise = null;
    promise = api.current.getForecast(params);
    promise.then(data => {
      setResData(data);
    });
  }
  useEffect(()=>{
    getForecastData();
  });
  if(resData){
    const days = resData.days;
    return <WeatherBoard unit={unit} days={days} forecast={forecast} lang={lang} location={resData.location.name} />
  }else{
    return  <div>Loading...</div>;
  }

};

Weather.propTypes = {
  unit: PropTypes.oneOf(['imperial', 'metric']).isRequired,
  forecast: PropTypes.oneOf(['today', '5days']).isRequired,
  lang: PropTypes.string.isRequired,
  apikey: PropTypes.string.isRequired,
  lat: PropTypes.string,
  lon: PropTypes.string,
  type: PropTypes.oneOf(["geo", "city"]),
  city: PropTypes.string,
}