import { useEffect, useState } from 'react';
import axios from 'axios';
import utils from './index';

export default ({ lang = 'en', measurement = 'metric', lat, lon, ...args }) => {
  const [error, setError] = useState(null);
  const [{ loading, loaded }, setLoading] = useState({ loading: false, loaded: false });
  const [forecast, setForecast] = useState({});
  const apikey = process.env.REACT_APP_WEATHER_API_KEY;
  const baseUri = '//api.openweathermap.org/data/2.5';
  const config = { lang, measurement, lat, lon, ...args };
  useEffect(()=>{
    //TODO fix double qpi call
    // if(!loaded){
      getForecast();
    // }
  }, [lat,lon, measurement]);
  const getForecast = ({ lang, measurement, lat, lon, ...args } = config) => {
    if(!loading){
      setLoading(true);
      const endPointToday = `${baseUri}/weather`;
      const params = Object.assign(
        {
          appid: apikey,
          cnt: 1,
          lang: lang,
          units: measurement,
          lat: lat,
          lon: lon,
        },
        args,
      );
      const promise = axios
        .all([
          axios.get(endPointToday, { params }),
        ])
        .then(
          axios.spread((todayReponse) => {
            const todayData = todayReponse.data;
            if (todayData) {
              return todayData;
            }
            return {};
          }),
        );
      promise.then(data => {
        setForecast(formatData(data, measurement, lang));
        setLoading({ loaded: true, loading: false });
      }).catch(error => {
        setError(error);
        setLoading({ loaded: true, loading: false });
      });

    }
   }

  return { forecast, loading, loaded, error, getForecast }
}

const formatData = (data, measurement = 'metric', lang = 'en') => {
  if (!data) return {};
  const { Humidity, Wind } = utils.getLangs(lang);
  const { temp, speed } = utils.getUnits(measurement);
  return {
    humidity: `${Humidity}: ${data.main?.humidity}%`,
    iconName: utils.getIcon(data.weather[0]?.icon),
    date: utils.formatDate(lang, data.dt),
    temperature: `${Math.round(data.main?.temp)}${temp}`,
    wind: `${Wind}: ${data.wind?.speed} ${speed}`,
    city: data.name,
  }
}
