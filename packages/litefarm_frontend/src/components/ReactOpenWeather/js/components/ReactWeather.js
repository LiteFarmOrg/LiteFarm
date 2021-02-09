import React from 'react';
import OpenWeatherApi from '../OpenWeatherApi';
import utils from '../utils';
import TodayForecast from './TodayForecast';
import DaysForecast from './DaysForecast';
import WeatherIcon from './WeatherIcon';
import '../../css/components/ReactWeather.scss';
import PropTypes from 'prop-types';

const propTypes = {
  unit: PropTypes.oneOf(['metric', 'imperial']),
  type: PropTypes.oneOf(['geo', 'city']),
  lat: PropTypes.string,
  lon: PropTypes.string,
  city: PropTypes.string,
  forecast: PropTypes.oneOf(['today', '5days']),
  apikey: PropTypes.string.isRequired,
  lang: PropTypes.string,
};

const defaultProps = {
  unit: 'metric',
  type: 'city',
  forecast: 'today',
  lang: 'en',
};

class ReactWeather extends React.Component {
  constructor(props) {
    super(props);
    this.api = new OpenWeatherApi(props.unit, props.apikey, props.lang);
    this.state = {
      data: null,
    };
  }
  render() {
    const { unit, forecast, lang } = this.props;
    const data = this.state.data;
    if (data) {
      const days = data.days;
      const today = days[0];
      const todayIcon = utils.getIcon(today.icon);
      return (
        <div className="rw-box">
          <div className={`rw-main type-${forecast}`}>
            <div className="rw-box-left">
              <h2>{data.location.name}</h2>
              <TodayForecast todayData={today} unit={unit} lang={lang} />
            </div>
            <div className="rw-box-right">
              <WeatherIcon name={todayIcon} />
            </div>
          </div>
          <DaysForecast unit={unit} forecast={forecast} daysData={days} lang={lang} />
        </div>
      );
    }
    return <div>Loading...</div>;
  }
  componentDidMount() {
    this.getForecastData();
  }

  componentDidUpdate(prevProps) {
    // Typical usage (don't forget to compare props):
    if (this.props.lat !== prevProps.lat || this.props.lon !== prevProps.lon) {
      this.getForecastData();
    }
  }

  getForecastData() {
    const self = this;
    const params = self._getParams();
    let promise = null;
    promise = self.api.getForecast(params);
    promise.then((data) => {
      self.setState({
        data,
      });
    });
  }
  _getParams() {
    const { type, lon, lat, city, lang } = this.props;
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
}

ReactWeather.propTypes = propTypes;
ReactWeather.defaultProps = defaultProps;

export default ReactWeather;
