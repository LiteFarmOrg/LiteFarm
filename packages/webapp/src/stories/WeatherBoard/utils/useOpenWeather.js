import { useState } from 'react';
import axios from 'axios';

export default () => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [forecast, setForecast] = useState({});
  const apikey = process.env.REACT_APP_WEATHER_API_KEY;
  const baseUri = '//api.openweathermap.org/data/2.5';
  const getForecast = ({lang='en', unit= 'metric', lat, lon, ...args }) => {
    setLoading(true);
    const endPointToday = `${baseUri}/weather`;
    const params = Object.assign(
      {
        appid: apikey,
        cnt: 5,
        lang: lang,
        units: unit,
        lat: lat,
        lon: lon
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
      setForecast(data);
      setLoading(false);
      setLoaded(true);
    }).catch(error => {
      setError(error);
      setLoading(false);
      setLoaded(true);
    });
  }

  return { forecast, loading, loaded, error, getForecast }
}