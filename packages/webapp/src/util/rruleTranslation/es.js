/*
 *  Copyright 2023 LiteFarm.org
 *  This file is part of LiteFarm.
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

const esStrings = {
  every: 'cada',
  until: 'hasta',
  day: 'día',
  days: 'días',
  week: 'semana',
  weeks: 'semanas',
  on: 'en',
  in: 'en',
  'on the': 'en el',
  for: 'para',
  and: 'y',
  or: 'o',
  at: 'en',
  last: 'último',
  st: '',
  nd: '',
  rd: '',
  th: '',
  '(~ approximate)': '(~ aproximado)',
  times: 'veces',
  time: 'tiempo',
  minutes: 'minutos',
  hours: 'horas',
  weekdays: 'días de entre semana',
  weekday: 'día de entre semana',
  months: 'meses',
  month: 'mes',
  years: 'años',
  year: 'año',
};

export default {
  getText: (id) => esStrings[id] || id,
  language: {
    dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
    monthNames: [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ],
  },
};
