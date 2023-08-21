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

const frStrings = {
  every: 'chaque',
  until: "jusqu'à",
  day: 'jour',
  days: 'jours',
  week: 'semaine',
  weeks: 'semaines',
  on: 'sur',
  in: 'dans',
  'on the': 'sur le',
  for: 'pour',
  and: 'et',
  or: 'ou',
  at: 'à',
  last: 'dernier',
  st: '',
  nd: '',
  rd: '',
  th: '',
  '(~ approximate)': '(~ approximatif)',
  times: 'fois',
  time: 'temps',
  minutes: 'minutes',
  hours: 'heures',
  weekdays: 'jours de la semaine',
  weekday: 'jour de la semaine',
  months: 'mois',
  month: 'mois',
  years: 'ans',
  year: 'an',
};

export default {
  getText: (id) => frStrings[id] || id,
  language: {
    dayNames: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
    monthNames: [
      'Janvier',
      'Février',
      'Mars',
      'Avril',
      'Mai',
      'Juin',
      'Juillet',
      'Août',
      'Septembre',
      'Octobre',
      'Novembre',
      'Décembre',
    ],
  },
};
