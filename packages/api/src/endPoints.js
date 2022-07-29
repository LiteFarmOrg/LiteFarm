/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (endPoints.js) is part of LiteFarm.
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

const endPoints = {
  googleMapsAPI: 'https://maps.googleapis.com/maps/api/elevation/json', // for grabbing elevation
  googleMapsAPIGeocode: 'https://maps.googleapis.com/maps/api/geocode/json', // for grabbing elevation
  openWeatherAPI: 'https://api.openweathermap.org/data/2.5/weather', // for grabbing weather data
  openMapsAPI: 'https://nominatim.openstreetmap.org/reverse', // to reverse geocode
  soilGridsAPI: 'https://rest.isric.org/soilgrids/v2.0/properties/query', // for grabbing soil organic matter when no soil analysis is present
  gbifAPI: 'http://api.gbif.org/v1/occurrence/search', // for grabbing species in biodiversity
};

module.exports = endPoints;