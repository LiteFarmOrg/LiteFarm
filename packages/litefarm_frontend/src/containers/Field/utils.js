/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (utils.js) is part of LiteFarm.
 *
 *  LiteFarm is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  LiteFarm is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details, see <https://www.gnu.org/licenses/>.
 */

export function calculatePolygonArea(gridPoints) {
  let area = 0;

  if (gridPoints.length > 2) {
    for (var i = 0; i < gridPoints.length - 1; i++) {
      let p1 = gridPoints[i];
      let p2 = gridPoints[i + 1];
      area +=
        convertToRadian(p2.lng - p1.lng) *
        (2 + Math.sin(convertToRadian(p1.lat)) + Math.sin(convertToRadian(p2.lat)));
    }

    area = (area * 6378137 * 6378137) / 2;
  }

  return Math.abs(area);
}

function convertToRadian(input) {
  return (input * Math.PI) / 180;
}

export function mydToDate(dateStr) {
  const [year, month, day] = dateStr.split('-');
  return new Date(year, month - 1, day);
}
