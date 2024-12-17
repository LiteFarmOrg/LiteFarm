import { fieldEnum } from '../constants';
import moment from 'moment';
import { useMatch } from 'react-router-dom';

export const useLocationPageType = () => {
  const isCreateLocationPage = useMatch('/create_location/') ? true : false;
  const isViewLocationPage = useMatch('/:location_id/details') ? true : false;
  const isEditLocationPage = useMatch('/:location_id/edit/') ? true : false;
  return {
    isCreateLocationPage,
    isViewLocationPage,
    isEditLocationPage,
  };
};

export const getFormData = (location) => {
  const result = { ...location };
  result[fieldEnum.transition_date] &&
    (result[fieldEnum.transition_date] = moment(result[fieldEnum.transition_date])
      .utc()
      .format('YYYY-MM-DD'));

  return result;
};
