export const getNewDate = (newInputFormatDateString) =>
  new Date(`${standardDateString(newInputFormatDateString)} 00:00:00`);

const standardDateString = (dateString) => dateString?.replace(/-/g, '/')