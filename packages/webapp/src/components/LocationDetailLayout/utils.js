import moment from "moment";

export const getPersistPath = (
  locationType,
  match,
  { isCreateLocationPage, isViewLocationPage, isEditLocationPage },
) => {
  return (
    (isCreateLocationPage && ['/map']) ||
    (isEditLocationPage && []) ||
    (isViewLocationPage && [`/${locationType}/${match.params.location_id}/edit`])
  );
};

export const getDateInputFormat = (date) => moment(date).utc().format('YYYY-MM-DD')