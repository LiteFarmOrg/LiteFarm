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
