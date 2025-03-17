import { useEffect } from 'react';
import PureWeatherBoard from '../../components/WeatherBoard';
import { useSelector } from 'react-redux';
import utils from './utils';
import { useTranslation } from 'react-i18next';
import { getLanguageFromLocalStorage } from '../../util/getLanguageFromLocalStorage';
import { userFarmSelector } from '../userFarmSlice';
import { useGetWeatherQuery } from '../../store/api/weatherApi';

export default function WeatherBoard() {
  const two_hours = 2 * 60 * 60 * 1000;
  const currentTime = new Date().getTime();
  const {
    units: { measurement },
    language_preference: lang,
    grid_points: { lat, lng: lon },
  } = useSelector(userFarmSelector);
  const {
    data,
    error,
    isSuccess: loaded,
    refetch,
  } = useGetWeatherQuery({ units: measurement, lang, lat, lon });
  const language_preference = getLanguageFromLocalStorage();

  useEffect(() => {
    if (currentTime - data?.lastUpdated > two_hours) {
      refetch();
    }
  }, []);
  const { t } = useTranslation();
  const { tempUnit, speedUnit } = utils.getUnits(measurement);
  const formattedForecast = {
    humidity: `${t('WEATHER.HUMIDITY')}: ${data?.humidity}`,
    iconName: data?.iconName,
    date: utils.formatDate(language_preference, data?.date ? data?.date * 1000 : new Date()),
    temperature: `${data?.temperature}${tempUnit}`,
    wind: `${t('WEATHER.WIND')}: ${data?.wind} ${speedUnit}`,
    city: data?.city,
  };

  return loaded && !error ? <PureWeatherBoard {...formattedForecast} /> : <span />;
}

WeatherBoard.propTypes = {};
