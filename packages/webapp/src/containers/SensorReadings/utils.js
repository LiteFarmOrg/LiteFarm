import moment from 'moment';
import { CHOSEN_GRAPH_DATAPOINTS } from './constants';

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

export const roundDownToNearestChosenPoint = (currentUnixTime) => {
  const currentHour = new Date(currentUnixTime).getHours();
  const chosenHours = CHOSEN_GRAPH_DATAPOINTS.map((point) => {
    const arr = point.split(':');
    return +arr[0];
  });

  let hour = chosenHours[chosenHours.length - 1];
  for (let i = 0; i < chosenHours.length; i++) {
    if (currentHour < chosenHours[i]) {
      break;
    }
    hour = chosenHours[i];
  }
  const nearestChosenUnixTime = new Date(currentUnixTime).setHours(hour, 0, 0, 0);

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
    return Math.round(elapsed / 1000) + ' seconds ago';
  } else if (elapsed < msPerHour) {
    return Math.round(elapsed / msPerMinute) + ' minutes ago';
  } else if (elapsed < msPerDay) {
    return Math.round(elapsed / msPerHour) + ' hours ago';
  } else if (elapsed < msPerMonth) {
    return Math.round(elapsed / msPerDay) + ' days ago';
  } else if (elapsed < msPerYear) {
    return Math.round(elapsed / msPerMonth) + ' months ago';
  } else {
    return '';
  }
};
