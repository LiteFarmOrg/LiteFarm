import moment from 'moment';
import { icons } from './icons';

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
        tempUnit: 'ºC',
        speedUnit: 'km/h',
      };
    } else if (measurement === 'imperial') {
      return {
        tempUnit: 'ºF',
        speedUnit: 'mph',
      };
    }
    return { tempUnit: '', speedUnit: '' };
  },
  formatDate(lang, dte) {
    if (dte && moment(dte).isValid()) {
      moment.locale(lang);
      return moment.unix(dte).format('ddd D MMMM');
    }
    return '';
  },
};

export default index;
