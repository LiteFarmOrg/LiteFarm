import moment from 'moment';
import { icons } from './icons';
import { langText } from './lang';

const index = {
  getIcon(icon) {
    if (!icon) {
      return 'na';
    }
    const icoClass = icons[icon];
    if (icoClass) {
      return icoClass;
    }
    return 'na';
  },
  getUnits(measurement) {
    if (measurement === 'metric') {
      return {
        temp: 'ºC',
        speed: 'km/h',
      };
    } else if (measurement === 'imperial') {
      return {
        temp: 'ºF',
        speed: 'mph',
      };
    }
    return { temp: '', speed: '' };
  },
  formatDate(lang, dte) {
    if (dte && moment(dte).isValid()) {
      moment.locale(lang);
      return moment.unix(dte).format('ddd D MMMM');
    }
    return '';
  },
  getLangs(lang) {
    return langText[lang] === undefined ? langText.en : langText[lang];
  },
};

export default index;
