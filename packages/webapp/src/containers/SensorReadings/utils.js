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
