import PureWeatherBoard from '../../components/WeatherBoard';
import { useSelector } from 'react-redux';
import utils from './utils';
import { useTranslation } from 'react-i18next';
import { getLanguageFromLocalStorage } from '../../util/getLanguageFromLocalStorage';
import { userFarmSelector } from '../userFarmSlice';
import { useGetWeatherQuery } from '../../store/api/weatherApi';

export default function WeatherBoard() {
  const {
    units: { measurement },
  } = useSelector(userFarmSelector);

  const {
    data,
    error,
    isSuccess: loaded,
  } = useGetWeatherQuery({
    measurementSystem: measurement,
  });
  const language_preference = getLanguageFromLocalStorage();

  const { t } = useTranslation();
  const { tempUnit, speedUnit } = utils.getUnits(data?.measurement);
  const formattedForecast = {
    humidity: `${t('WEATHER.HUMIDITY')}: ${data?.humidity}%`,
    iconName: utils.getIcon(data?.icon),
    date: utils.formatDate(language_preference, data?.date ? data?.date * 1000 : new Date()),
    temperature: `${data?.temp}${tempUnit}`,
    wind: `${t('WEATHER.WIND')}: ${data?.wind} ${speedUnit}`,
    city: data?.city,
  };

  return loaded && !error ? <PureWeatherBoard {...formattedForecast} /> : <span />;
}

WeatherBoard.propTypes = {};
