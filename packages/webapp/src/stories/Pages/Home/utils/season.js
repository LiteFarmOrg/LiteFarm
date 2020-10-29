import moment from 'moment';
import autumn from '../../../assets/home/home bg-2-min.png'
import winter from '../../../assets/home/home bg-5-min.png'
import spring from '../../../assets/home/home bg-7-min.png'
import summer from '../../../assets/home/home bg-8 2-min.png'

export const getSeason = (lat) => {
  const isNorth = lat > 0;
  const now = moment();
  const year = now.get('year');
  const autumnStartDate = moment(`${year}-9-1`);
  const springStartDate = moment(`${year}-3-1`);
  const summerStartDate = moment(`${year}-6-1`);
  const winterStartDate = moment(`${year}-12-1`);
  if(now.isBefore(springStartDate)){
    return isNorth? winter: summer;
  }else if(now.isBefore(summerStartDate)){
    return isNorth? spring: autumn;
  }else if(now.isBefore(autumnStartDate)){
    return isNorth? summer: winter;
  }else if(now.isBefore(winterStartDate)){
    return isNorth? autumn: spring;
  }else return isNorth? winter: summer;
}