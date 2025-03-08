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
  const durationString = `${hours > 0 ? `${hours}h ` : ''}${minutes > 0 ? `${minutes}m` : ''}`;
  return durationString;
}
