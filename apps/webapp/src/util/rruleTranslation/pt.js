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

const ptStrings = {
  every: 'cada',
  until: 'até',
  day: 'dia',
  days: 'dias',
  week: 'semana',
  weeks: 'semanas',
  on: 'em',
  in: 'em',
  'on the': 'no',
  for: 'para',
  and: 'e',
  or: 'ou',
  at: 'em',
  last: 'último',
  st: 'º',
  nd: 'º',
  rd: 'º',
  th: 'º',
  '(~ approximate)': '(~ aproximado)',
  times: 'vezes',
  time: 'tempo',
  minutes: 'minutos',
  hours: 'horas',
  weekdays: 'dias da semana',
  weekday: 'dia da semana',
  months: 'meses',
  month: 'mês',
  years: 'anos',
  year: 'ano',
};

export default {
  getText: (id) => ptStrings[id] || id,
  language: {
    dayNames: [
      'Domingo',
      'Segunda-feira',
      'Terça-feira',
      'Quarta-feira',
      'Quinta-feira',
      'Sexta-feira',
      'Sábado',
    ],
    monthNames: [
      'Janeiro',
      'Fevereiro',
      'Março',
      'Abril',
      'Maio',
      'Junho',
      'Julho',
      'Agosto',
      'Setembro',
      'Outubro',
      'Novembro',
      'Dezembro',
    ],
  },
};
