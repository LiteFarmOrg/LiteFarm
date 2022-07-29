import moment from 'moment';
import { DO_CDN_URL } from '../../../util/constants';

const autumn = `${DO_CDN_URL}/home/fall.webp`;
const winter = `${DO_CDN_URL}/home/winter.webp`;
const spring = `${DO_CDN_URL}/home/spring.webp`;
const summer = `${DO_CDN_URL}/home/summer.webp`;

export const getSeason = (lat) => {
  const isNorth = lat > 0;
  const now = moment();
  const year = now.get('year');
  const autumnStartDate = moment(`${year}-9-1`);
  const springStartDate = moment(`${year}-3-1`);
  const summerStartDate = moment(`${year}-6-1`);
  const winterStartDate = moment(`${year}-12-1`);
  if (now.isBefore(springStartDate)) {
    return isNorth ? winter : summer;
  } else if (now.isBefore(summerStartDate)) {
    return isNorth ? spring : autumn;
  } else if (now.isBefore(autumnStartDate)) {
    return isNorth ? summer : winter;
  } else if (now.isBefore(winterStartDate)) {
    return isNorth ? autumn : spring;
  } else return isNorth ? winter : summer;
};
