export function getTimeDifferrenceInSeconds(pastDate: Date, futureDate: Date) {
  return (futureDate.getTime() - pastDate.getTime()) / 1000;
}

export function getDurationString(timeInSeconds: number) {
  if (timeInSeconds === 0) {
    return '0m';
  }

  const timeInMinutes = Math.round(timeInSeconds / 60);
  const hours = Math.round(timeInMinutes / 60);
  const minutes = Math.round(timeInMinutes - hours * 60);
  const durationString = `${hours > 0 ? `${hours}h ` : ''}${minutes > 0 ? `${minutes}m` : '<1m'}`;
  return durationString;
}

export function isSameDay(date1: Date, date2: Date) {
  if (!date1 || !date2) {
    return false;
  }
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth()
  );
}
