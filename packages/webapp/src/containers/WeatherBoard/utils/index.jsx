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
    return new Date(dte * 1000).toLocaleDateString(lang, {
      weekday: 'short',
      day: 'numeric',
      month: 'long',
    });
  },
};

export default index;
