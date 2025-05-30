import moment from 'moment';
import { timeDifference } from '../../util/timeDifference';

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

  // E.g. Nepal Time (UTC+5:45) utcOffsetMinutes = -45
  // E.g. IF Inverse Nepal Time existed (UTC-5:45) utcOffsetMinutes = 45
  let utcOffsetMinutes = currentDateTime.getTimezoneOffset() % 60;
  // E.g. Nepal Time (UTC+5:45) forwardUtcOffsetMinutes = 45,
  // E.g. IF Inverse Nepal Time existed (UTC-5:45) forwardUtcOffsetMinutes = 15
  let forwardUtcOffsetMinutes = (60 - utcOffsetMinutes) % 60;
  let backUtcOffsetMinutes = (60 + utcOffsetMinutes) % 60;
  let forwardAdjustmentUnix = forwardUtcOffsetMinutes * 60;
  let backAdjustmentUnix = backUtcOffsetMinutes * 60;

  return {
    endUnixTime,
    startUnixTime,
    currentDateTime,
    forwardUtcOffsetMinutes,
    forwardAdjustmentUnix,
    backAdjustmentUnix,
  };
};

export const roundDownToNearestTimepoint = (currentUnixTime, utcOffsetMinutes) => {
  const currentHour = new Date(currentUnixTime).getHours();
  const nearestChosenUnixTime = new Date(currentUnixTime).setHours(
    currentHour,
    Math.abs(utcOffsetMinutes),
    0,
    0,
  );

  return moment(nearestChosenUnixTime).format('ddd MMM DD YYYY HH:mm');
};
