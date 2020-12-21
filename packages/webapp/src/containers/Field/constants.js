/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (constants.js) is part of LiteFarm.
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

import moment from 'moment';

require('dotenv').config();
export const FARM_BOUNDS = [{lat:49.251935,lng:-123.239568},{lat:49.249828, lng:-123.233245},{lat:49.247568, lng:-123.234412},{lat:49.247568, lng:-123.234412}];
export const CENTER = {
  lat: 49.249660,
  lng: -123.237421
};
export const DEFAULT_ZOOM = 15;
export const GMAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

export const NEXT_BUTTON = "nextButton";
export const SMALL_NEXT_BUTTON = "smallNextButton";
export const POLYGON_BUTTON = "polygonButton";
export const CLEAR_BUTTON = "clearButton";
export const BACK_TO_STEP_ONE = "backToStepOne";
export const POLYGON_COMPLETE = "polygonComplete";

export const GET_CROPS = 'GET_CROPS_EDIT_FIELD';
export const GET_EXPIRED_CROPS = 'GET_EXPIRED_CROPS';

export const SET_CROPS_IN_STATE = 'SET_CROPS_IN_STATE_EDIT_FIELD';
export const SET_EXPIRED_CROPS_IN_STATE = 'SET_EXPIRED_CROPS_IN_STATE';

export const EDIT_FIELD_CROP = 'EDIT_FIELD_CROP';
export const DELETE_FIELD_CROP = 'DELETE_FIELD_CROP';
export const UPDATE_FIELD = 'UPDATE_FIELD';

// YIELD STUFF
export const CREATE_YIELD = 'CREATE_YIELD';
export const SET_YIELD_IN_STATE = 'SET_YIELD_IN_STATE';
export const GET_YIELD = 'GET_YIELD';

// PRICE STUFF
export const CREATE_PRICE = 'CREATE_PRICE';
export const SET_PRICE_IN_STATE = 'SET_PRICE_IN_STATE';
export const GET_PRICE = 'GET_PRICE';

export const TREE_ICON = "M54.144-11.447q0 .936-.684 1.62t-1.62.684h-16.632q.036.612.216 3.15t.18 3.906q0 .9-.648 1.53t-1.548.63h-11.52q-.9 0-1.548-.63t-.648-1.53q0-1.368.18-3.906t.216-3.15h-16.632q-.936 0-1.62-.684t-.684-1.62.684-1.62l14.472-14.508h-8.244q-.936 0-1.62-.684t-.684-1.62.684-1.62l14.472-14.508h-7.092q-.936 0-1.62-.684t-.684-1.62.684-1.62l13.824-13.824q.684-.684 1.62-.684t1.62.684l13.824 13.824q.684.684.684 1.62t-.684 1.62-1.62.684h-7.092l14.472 14.508q.684.684.684 1.62t-.684 1.62-1.62.684h-8.244l14.472 14.508q.684.684.684 1.62z";

export const FIELD_CROPS_INIT = {
  area_used: "",
  crop_id: "",
  end_date: moment().add(1,'M'),
  estimated_price: "",
  estimated_yield: "",
  start_date: moment(),
};
export const DISPLAY_NONE = "none";
export const DISPLAY_DEFAULT = "block";

// decimal radix
export const DEC_RADIX = 10;

export const DELETE_FIELD = 'DELETE_FIELD';
