import moment from 'moment';
import { DO_CDN_URL } from '../../../util/constants';

const autumn = `${DO_CDN_URL}/home/fall.webp`;
const winter = `${DO_CDN_URL}/home/winter.webp`;
const spring = `${DO_CDN_URL}/home/spring.webp`;
const summer = `${DO_CDN_URL}/home/summer.webp`;

export const getSeason = (lat) => {
  const isNorth = lat > 0;
  const now = new Date();
  const year = now.getFullYear();
  const autumnStartDate = new Date(year, 8, 1);
  const springStartDate = new Date(year, 2, 1);
  const summerStartDate = new Date(year, 5, 1);
  const winterStartDate = new Date(year, 11, 1);
  if (now < springStartDate) {
    return isNorth ? winter : summer;
  } else if (now < summerStartDate) {
    return isNorth ? spring : autumn;
  } else if (now < autumnStartDate) {
    return isNorth ? summer : winter;
  } else if (now < winterStartDate) {
    return isNorth ? autumn : spring;
  } else return isNorth ? winter : summer;
};
