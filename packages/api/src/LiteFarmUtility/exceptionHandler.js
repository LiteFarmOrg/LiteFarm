/* 
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>   
 *  This file (exceptionHandler.js) is part of LiteFarm.
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

const KEY_NOT_FOUND = '23503';
const KEY_NOT_DEFINED = '400';

const UUID_WRONG_FORMAT = '22P02';
const MODEL_VALIDATION = 'ModelValidation';

const DUPLICATE_PK = '23505';

class exceptionHandler {
  static handleException(e){
    if(e.type === MODEL_VALIDATION){
      return { status:400, message:e.message }
    }
    switch(e.code){
    case KEY_NOT_FOUND:
      return { status:400, message:getKeyNotFound(e.detail)+ ' was not found' };
    case KEY_NOT_DEFINED:
      return { status:400, message:e.message };
    case UUID_WRONG_FORMAT:
      return { status:400, message:'wrong UUID format' };
    case DUPLICATE_PK:
      return { status: 400, message: e.message };
    default:
      return { status:404, message:e.message }
    }

  }
}
function getKeyNotFound(detail){
  const endingIndexOfKey = detail.indexOf(')');
  return detail.substring(5, endingIndexOfKey);
}


module.exports = exceptionHandler;
