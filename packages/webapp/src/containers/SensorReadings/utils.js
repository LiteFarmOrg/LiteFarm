import moment from 'moment';
import i18n from '../../locales/i18n';

export const getMiddle = (prop, markers) => {
  let values = markers.map((m) => m[prop]);
  let min = Math.min(...values);
  let max = Math.max(...values);
  if (prop === 'lng' && max - min > 180) {
    values = values.map((val) => (val < max - 180 ? val + 360 : val));
    min = Math.min(...values);
    max = Math.max(...values);
  }
  let result = (min + max) / 2;
  if (prop === 'lng' && result > 180) {
    result -= 360;
  }
  return result;
};

export const findCenter = (markers) => {
  return {
    lat: getMiddle('lat', markers),
    lng: getMiddle('lng', markers),
  };
};

export const getLastUpdatedTime = (readings) =>
  timeDifference(
    new Date(),
    new Date(
      Math.max(
        ...readings.filter((e) => e < parseInt(+new Date() / 1000)).map((e) => new Date(+e * 1000)),
      ),
    ),
  );

export const getDates = () => {
  let currentDateTime = new Date();

  let endUnixTimeMs = new Date().setDate(currentDateTime.getDate() + 2);
  let endMidnightUnixTimeMs = new Date(endUnixTimeMs).setHours(0, 0, 0, 0);
  let endUnixTime = parseInt(+endMidnightUnixTimeMs / 1000);

  let startUnixTimeMs = new Date().setDate(currentDateTime.getDate() - 3);
  let startMidnightUnixTimeMs = new Date(startUnixTimeMs).setHours(0, 0, 0, 0);
  let startUnixTime = parseInt(+startMidnightUnixTimeMs / 1000);

  const formattedEndDate = moment(endMidnightUnixTimeMs).format('MM-DD-YYYY');

  return {
    endUnixTime,
    startUnixTime,
    currentDateTime,
    formattedEndDate,
  };
};

export const roundDownToNearestHour = (currentUnixTime) => {
  const currentHour = new Date(currentUnixTime).getHours();
  const nearestChosenUnixTime = new Date(currentUnixTime).setHours(currentHour, 0, 0, 0);

  return moment(nearestChosenUnixTime).format('ddd MMMM D YYYY HH:mm');
};

const timeDifference = (current, previous) => {
  var msPerMinute = 60 * 1000;
  var msPerHour = msPerMinute * 60;
  var msPerDay = msPerHour * 24;
  var msPerMonth = msPerDay * 30;
  var msPerYear = msPerDay * 365;

  var elapsed = current - previous;

  if (elapsed < msPerMinute) {
    return i18n.t('translation:SENSOR.SECONDS_AGO', { time: Math.round(elapsed / 1000) });
  } else if (elapsed < msPerHour) {
    return i18n.t('translation:SENSOR.MINUTES_AGO', { time: Math.round(elapsed / msPerMinute) });
  } else if (elapsed < msPerDay) {
    return i18n.t('translation:SENSOR.HOURS_AGO', { time: Math.round(elapsed / msPerHour) });
  } else if (elapsed < msPerMonth) {
    return i18n.t('translation:SENSOR.DAYS_AGO', { time: Math.round(elapsed / msPerDay) });
  } else if (elapsed < msPerYear) {
    return i18n.t('translation:SENSOR.MONTHS_AGO', { time: Math.round(elapsed / msPerMonth) });
  } else {
    return '';
  }
};
