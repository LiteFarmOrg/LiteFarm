import moment from 'moment';
import 'moment/locale/pt';
import 'moment/locale/es';
import 'moment/locale/fr';
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
      return moment.unix(dte).locale(lang).format('ddd D MMMM');
    }
    return '';
  },
};

export default index;
