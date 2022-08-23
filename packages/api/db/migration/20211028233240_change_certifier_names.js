/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (20211028233240_change_certifier_names.js) is part of LiteFarm.
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

export const up = function (knex) {
  return Promise.all([
    knex('certifiers')
      .update({ certifier_name: 'Rede Ecovida de Agroecologia' })
      .where('certifier_name', 'Rede Ecovida'),
    knex('certifiers')
      .update({ certifier_name: 'Rede de Agroecologia Povos da Mata' })
      .where('certifier_name', 'Redes Povos da Mata'),
  ]);
};

export const down = function (knex) {
  return Promise.all([
    knex('certifiers')
      .update({ certifier_name: 'Rede Ecovida' })
      .where('certifier_name', 'Rede Ecovida de Agroecologia'),
    knex('certifiers')
      .update({ certifier_name: 'Redes Povos da Mata' })
      .where('certifier_name', 'Rede de Agroecologia Povos da Mata'),
  ]);
};
