import moment from 'moment';
import { icons } from './icons';
import { langText } from './lang';

const utils = {
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
  getUnits(unit) {
    if (unit === 'metric') {
      return {
        temp: 'C',
        speed: 'km/h',
      };
    } else if (unit === 'imperial') {
      return {
        temp: 'F',
        speed: 'mph',
      };
    }
    return { temp: '', speed: '' };
  },
  formatDate(dte, lang) {
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

export default utils;
