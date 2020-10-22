import axios from 'axios';
import index from './utils';

export default class OpenWeatherApi {
  constructor(unit, apiKey, lang) {
    this.unit = unit;
    this.apiKey = apiKey;
    this.baseApiUrl = '//api.openweathermap.org/data/2.5';
    this.lang = lang;
  }
  getForecast(args) {
    const endpointForecast = `${this.baseApiUrl}/forecast`;
    const endPointToday = `${this.baseApiUrl}/weather`;
    const params = Object.assign(
      {
        appid: this.apiKey,
        cnt: 5,
        lang: this.lang,
        units: this.unit,
      },
      args
    );

    const promise = axios
      .all([
        axios.get(endpointForecast, { params }),
        axios.get(endPointToday, { params }),
      ])
      .then(
        axios.spread((forecastReponse, todayReponse) => {
          const forecastData = forecastReponse.data;
          const todayData = todayReponse.data;
          if (forecastData && todayData) {
            return this._map(forecastData, todayData, params.lang);
          }
          return {};
        })
      );
    return promise;
  }
  _map(forecastData, todayData, lang) {
    const daysData = forecastData.list;
    const mapped = {};
    mapped.location = forecastData.city;
    mapped.days = daysData.map(item => ({
      date: index.formatDate(item.dt, lang),
      description: item.weather[0] ? item.weather[0].main : null,
      icon: item.weather[0] ? item.weather[0].icon : null,
      temperature: {
        min: item.main.temp_min.toFixed(0),
        max: item.main.temp_max.toFixed(0),
      },
      wind: item.wind.speed.toFixed(0),
      humidity: item.main.humidity,
    }));
    if (mapped.days.length > 0) {
      mapped.days[0].temperature.current = todayData.main.temp.toFixed(0);
    }
    return mapped;
  }
}
