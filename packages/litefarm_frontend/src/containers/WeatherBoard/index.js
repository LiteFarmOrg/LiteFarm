import React, { useEffect } from 'react';
import PureWeatherBoard from '../../components/WeatherBoard';
import { useDispatch, useSelector } from 'react-redux';
import { weatherSelector } from './weatherSlice';
import { getWeather } from './saga';
import utils from './utils';
import { useTranslation } from 'react-i18next';
import { userFarmSelector } from '../userFarmSlice';

export default function WeatherBoard() {
  const {
    error,
    loaded,
    date,
    humidity,
    iconName,
    temperature,
    wind,
    measurement,
    city,
  } = useSelector(weatherSelector);
  const language_preference = localStorage.getItem('litefarm_lang');
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getWeather());
  }, []);
  const { t } = useTranslation();
  const { tempUnit, speedUnit } = utils.getUnits(measurement);
  const formattedForecast = {
    humidity: `${t('WEATHER.HUMIDITY')}: ${humidity}`,
    iconName,
    date: utils.formatDate(language_preference, date),
    temperature: `${temperature}${tempUnit}`,
    wind: `${t('WEATHER.WIND')}: ${wind} ${speedUnit}`,
    city,
  };

  return loaded && !error ? <PureWeatherBoard {...formattedForecast} /> : <span />;
}

WeatherBoard.propTypes = {};
