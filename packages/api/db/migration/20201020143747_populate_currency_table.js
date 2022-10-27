/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (20200623235501_add_permissions_values.js) is part of LiteFarm.
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
    knex('currency_table').insert([
      {
        country_name: 'Afghanistan',
        currency: 'Afghan afghani',
        symbol: '؋',
        iso: 'AFN',
        unit: 'Metric',
      },
      {
        country_name: 'Albania',
        currency: 'Albanian lek',
        symbol: 'L',
        iso: 'ALL',
        unit: 'Metric',
      },
      {
        country_name: 'Algeria',
        currency: 'Algerian dinar',
        symbol: 'د.ج',
        iso: 'DZD',
        unit: 'Metric',
      },
      { country_name: 'Andorra', currency: 'Euro', symbol: '€', iso: 'EUR', unit: 'Metric' },
      {
        country_name: 'Angola',
        currency: 'Angolan kwanza',
        symbol: 'Kz',
        iso: 'AOA',
        unit: 'Metric',
      },
      {
        country_name: 'Anguilla',
        currency: 'Eastern Caribbean dollar',
        symbol: '$',
        iso: 'XCD',
        unit: 'Metric',
      },
      {
        country_name: 'Antigua and Barbuda',
        currency: 'Eastern Caribbean dollar',
        symbol: '$',
        iso: 'XCD',
        unit: 'Metric',
      },
      {
        country_name: 'Argentina',
        currency: 'Argentine peso',
        symbol: '$',
        iso: 'ARS',
        unit: 'Metric',
      },
      {
        country_name: 'Armenia',
        currency: 'Armenian dram',
        symbol: '֏',
        iso: 'AMD',
        unit: 'Metric',
      },
      { country_name: 'Aruba', currency: 'Aruban florin', symbol: 'ƒ', iso: 'AWG', unit: 'Metric' },

      {
        country_name: 'Australia',
        currency: 'Australian dollar',
        symbol: '$',
        iso: 'AUD',
        unit: 'Metric',
      },

      { country_name: 'Austria', currency: 'Euro', symbol: '€', iso: 'EUR', unit: 'Metric' },

      {
        country_name: 'Azerbaijan',
        currency: 'Azerbaijani manat',
        symbol: '₼',
        iso: 'AZN',
        unit: 'Metric',
      },

      {
        country_name: 'The Bahamas',
        currency: 'Bahamian dollar',
        symbol: '$',
        iso: 'BSD',
        unit: 'Metric',
      },

      {
        country_name: 'Bahrain',
        currency: 'Bahraini dinar',
        symbol: '.د.ب',
        iso: 'BHD',
        unit: 'Metric',
      },

      {
        country_name: 'Bangladesh',
        currency: 'Bangladeshi taka',
        symbol: '৳',
        iso: 'BDT',
        unit: 'Metric',
      },

      {
        country_name: 'Barbados',
        currency: 'Barbadian dollar',
        symbol: '$',
        iso: 'BBD',
        unit: 'Metric',
      },

      {
        country_name: 'Belarus',
        currency: 'Belarusian ruble',
        symbol: 'Br',
        iso: 'BYN',
        unit: 'Metric',
      },

      { country_name: 'Belgium', currency: 'Euro', symbol: '€', iso: 'EUR', unit: 'Metric' },

      {
        country_name: 'Belize',
        currency: 'Belize dollar',
        symbol: '$',
        iso: 'BZD',
        unit: 'Metric',
      },

      {
        country_name: 'Benin',
        currency: 'West African CFA franc',
        symbol: 'Fr',
        iso: 'XOF',
        unit: 'Metric',
      },

      {
        country_name: 'Bermuda',
        currency: 'Bermudian dollar',
        symbol: '$',
        iso: 'BMD',
        unit: 'Metric',
      },

      {
        country_name: 'Bhutan',
        currency: 'Bhutanese ngultrum',
        symbol: 'Nu.',
        iso: 'BTN',
        unit: 'Metric',
      },

      {
        country_name: 'Bolivia',
        currency: 'Bolivian boliviano',
        symbol: 'Bs.',
        iso: 'BOB',
        unit: 'Metric',
      },

      {
        country_name: 'Bonaire',
        currency: 'United States dollar',
        symbol: '$',
        iso: 'USD',
        unit: 'Metric',
      },

      {
        country_name: 'Bosnia and Herzegovina',
        currency: 'Bosnia and Herzegovina convertible mark',
        symbol: 'KM',
        iso: 'BAM',
        unit: 'Metric',
      },

      {
        country_name: 'Botswana',
        currency: 'Botswana pula',
        symbol: 'P',
        iso: 'BWP',
        unit: 'Metric',
      },

      {
        country_name: 'Brazil',
        currency: 'Brazilian real',
        symbol: 'R$',
        iso: 'BRL',
        unit: 'Metric',
      },

      {
        country_name: 'British Indian Ocean Territory',
        currency: 'United States dollar',
        symbol: '$',
        iso: 'USD',
        unit: 'Metric',
      },

      {
        country_name: 'British Virgin Islands',
        currency: 'United States dollar',
        symbol: '$',
        iso: 'USD',
        unit: 'Metric',
      },

      {
        country_name: 'Brunei',
        currency: 'Brunei dollar',
        symbol: '$',
        iso: 'BND',
        unit: 'Metric',
      },

      {
        country_name: 'Bulgaria',
        currency: 'Bulgarian lev',
        symbol: 'лв.',
        iso: 'BGN',
        unit: 'Metric',
      },

      {
        country_name: 'Burkina Faso',
        currency: 'West African CFA franc',
        symbol: 'Fr',
        iso: 'XOF',
        unit: 'Metric',
      },

      {
        country_name: 'Burundi',
        currency: 'Burundian franc',
        symbol: 'Fr',
        iso: 'BIF',
        unit: 'Metric',
      },

      {
        country_name: 'Cambodia',
        currency: 'Cambodian riel',
        symbol: '៛',
        iso: 'KHR',
        unit: 'Metric',
      },

      {
        country_name: 'Cameroon',
        currency: 'Central African CFA franc',
        symbol: 'Fr',
        iso: 'XAF',
        unit: 'Metric',
      },

      {
        country_name: 'Canada',
        currency: 'Canadian dollar',
        symbol: '$',
        iso: 'CAD',
        unit: 'Metric',
      },

      {
        country_name: 'Cape Verde',
        currency: 'Cape Verdean escudo',
        symbol: 'Esc',
        iso: 'CVE',
        unit: 'Metric',
      },

      {
        country_name: 'Cayman Islands',
        currency: 'Cayman Islands dollar',
        symbol: '$',
        iso: 'KYD',
        unit: 'Metric',
      },

      {
        country_name: 'Central African Republic',
        currency: 'Central African CFA franc',
        symbol: 'Fr',
        iso: 'XAF',
        unit: 'Metric',
      },

      {
        country_name: 'Chad',
        currency: 'Central African CFA franc',
        symbol: 'Fr',
        iso: 'XAF',
        unit: 'Metric',
      },

      { country_name: 'Chile', currency: 'Chilean peso', symbol: '$', iso: 'CLP', unit: 'Metric' },

      { country_name: 'China', currency: 'Chinese yuan', symbol: '元', iso: 'CNY', unit: 'Metric' },

      {
        country_name: 'Colombia',
        currency: 'Colombian peso',
        symbol: '$',
        iso: 'COP',
        unit: 'Metric',
      },

      {
        country_name: 'Comoros',
        currency: 'Comorian franc',
        symbol: 'Fr',
        iso: 'KMF',
        unit: 'Metric',
      },

      {
        country_name: 'Democratic Republic of the Congo',
        currency: 'Congolese franc',
        symbol: 'Fr',
        iso: 'CDF',
        unit: 'Metric',
      },

      {
        country_name: 'Republic of the Congo',
        currency: 'Central African CFA franc',
        symbol: 'Fr',
        iso: 'XAF',
        unit: 'Metric',
      },

      {
        country_name: 'Cook Islands',
        currency: 'Cook Islands dollar',
        symbol: '$',
        iso: 'CKD[G]',
        unit: 'Metric',
      },

      {
        country_name: 'Costa Rica',
        currency: 'Costa Rican colón',
        symbol: '₡',
        iso: 'CRC',
        unit: 'Metric',
      },

      {
        country_name: "Côte d'Ivoire",
        currency: 'West African CFA franc',
        symbol: 'Fr',
        iso: 'XOF',
        unit: 'Metric',
      },

      {
        country_name: 'Croatia',
        currency: 'Croatian kuna',
        symbol: 'kn',
        iso: 'HRK',
        unit: 'Metric',
      },

      { country_name: 'Cuba', currency: 'Cuban peso', symbol: '$', iso: 'CUP', unit: 'Metric' },

      {
        country_name: 'Curaçao',
        currency: 'Netherlands Antillean guilder',
        symbol: 'ƒ',
        iso: 'ANG',
        unit: 'Metric',
      },

      { country_name: 'Cyprus', currency: 'Euro', symbol: '€', iso: 'EUR', unit: 'Metric' },

      {
        country_name: 'Czech Republic',
        currency: 'Czech koruna',
        symbol: 'Kč',
        iso: 'CZK',
        unit: 'Metric',
      },

      {
        country_name: 'Denmark',
        currency: 'Danish krone',
        symbol: 'kr',
        iso: 'DKK',
        unit: 'Metric',
      },

      {
        country_name: 'Djibouti',
        currency: 'Djiboutian franc',
        symbol: 'Fr',
        iso: 'DJF',
        unit: 'Metric',
      },

      {
        country_name: 'Dominica',
        currency: 'Eastern Caribbean dollar',
        symbol: '$',
        iso: 'XCD',
        unit: 'Metric',
      },

      {
        country_name: 'Dominican Republic',
        currency: 'Dominican peso',
        symbol: '$',
        iso: 'DOP',
        unit: 'Metric',
      },

      {
        country_name: 'East Timor',
        currency: 'United States dollar',
        symbol: '$',
        iso: 'USD',
        unit: 'Metric',
      },

      {
        country_name: 'Ecuador',
        currency: 'United States dollar',
        symbol: '$',
        iso: 'USD',
        unit: 'Metric',
      },

      {
        country_name: 'Egypt',
        currency: 'Egyptian pound',
        symbol: 'ج.م',
        iso: 'EGP',
        unit: 'Metric',
      },

      {
        country_name: 'El Salvador',
        currency: 'United States dollar',
        symbol: '$',
        iso: 'USD',
        unit: 'Metric',
      },

      {
        country_name: 'Equatorial Guinea',
        currency: 'Central African CFA franc',
        symbol: 'Fr',
        iso: 'XAF',
        unit: 'Metric',
      },

      {
        country_name: 'Eritrea',
        currency: 'Eritrean nakfa',
        symbol: 'Nfk',
        iso: 'ERN',
        unit: 'Metric',
      },

      { country_name: 'Estonia', currency: 'Euro', symbol: '€', iso: 'EUR', unit: 'Metric' },

      {
        country_name: 'Eswatini',
        currency: 'Swazi lilangeni',
        symbol: 'L',
        iso: 'SZL',
        unit: 'Metric',
      },

      {
        country_name: 'Ethiopia',
        currency: 'Ethiopian birr',
        symbol: 'Br',
        iso: 'ETB',
        unit: 'Metric',
      },

      {
        country_name: 'Falkland Islands',
        currency: 'Falkland Islands pound',
        symbol: '£',
        iso: 'FKP',
        unit: 'Metric',
      },

      {
        country_name: 'Faroe Islands',
        currency: 'Danish krone',
        symbol: 'kr',
        iso: 'DKK',
        unit: 'Metric',
      },

      { country_name: 'Fiji', currency: 'Fijian dollar', symbol: '$', iso: 'FJD', unit: 'Metric' },

      { country_name: 'Finland', currency: 'Euro', symbol: '€', iso: 'EUR', unit: 'Metric' },

      { country_name: 'France', currency: 'Euro', symbol: '€', iso: 'EUR', unit: 'Metric' },

      {
        country_name: 'French Polynesia',
        currency: 'CFP franc',
        symbol: '₣',
        iso: 'XPF',
        unit: 'Metric',
      },

      {
        country_name: 'Gabon',
        currency: 'Central African CFA franc',
        symbol: 'Fr',
        iso: 'XAF',
        unit: 'Metric',
      },

      {
        country_name: 'The Gambia',
        currency: 'Gambian dalasi',
        symbol: 'D',
        iso: 'GMD',
        unit: 'Metric',
      },

      {
        country_name: 'Georgia',
        currency: 'Georgian lari',
        symbol: '₾',
        iso: 'GEL',
        unit: 'Metric',
      },

      { country_name: 'Germany', currency: 'Euro', symbol: '€', iso: 'EUR', unit: 'Metric' },

      { country_name: 'Ghana', currency: 'Ghanaian cedi', symbol: '₵', iso: 'GHS', unit: 'Metric' },

      { country_name: 'Greece', currency: 'Euro', symbol: '£', iso: 'EUR', unit: 'Metric' },

      {
        country_name: 'Grenada',
        currency: 'Eastern Caribbean dollar',
        symbol: '$',
        iso: 'XCD',
        unit: 'Metric',
      },

      {
        country_name: 'Guatemala',
        currency: 'Guatemalan quetzal',
        symbol: 'Q',
        iso: 'GTQ',
        unit: 'Metric',
      },

      {
        country_name: 'Guinea',
        currency: 'Guinean franc',
        symbol: 'Fr',
        iso: 'GNF',
        unit: 'Metric',
      },

      {
        country_name: 'Guinea-Bissau',
        currency: 'West African CFA franc',
        symbol: 'Fr',
        iso: 'XOF',
        unit: 'Metric',
      },

      {
        country_name: 'Guyana',
        currency: 'Guyanese dollar',
        symbol: '$',
        iso: 'GYD',
        unit: 'Metric',
      },

      {
        country_name: 'Haiti',
        currency: 'Haitian gourde',
        symbol: 'G',
        iso: 'HTG',
        unit: 'Metric',
      },

      {
        country_name: 'Honduras',
        currency: 'Honduran lempira',
        symbol: 'L',
        iso: 'HNL',
        unit: 'Metric',
      },

      {
        country_name: 'Hong Kong',
        currency: 'Hong Kong dollar',
        symbol: '$',
        iso: 'HKD',
        unit: 'Metric',
      },

      {
        country_name: 'Hungary',
        currency: 'Hungarian forint',
        symbol: 'Ft',
        iso: 'HUF',
        unit: 'Metric',
      },

      {
        country_name: 'Iceland',
        currency: 'Icelandic króna',
        symbol: 'kr',
        iso: 'ISK',
        unit: 'Metric',
      },

      { country_name: 'India', currency: 'Indian rupee', symbol: '₹', iso: 'INR', unit: 'Metric' },

      {
        country_name: 'Indonesia',
        currency: 'Indonesian rupiah',
        symbol: 'Rp',
        iso: 'IDR',
        unit: 'Metric',
      },

      { country_name: 'Iran', currency: 'Iranian rial', symbol: '﷼', iso: 'IRR', unit: 'Metric' },

      { country_name: 'Iraq', currency: 'Iraqi dinar', symbol: 'ع.د', iso: 'IQD', unit: 'Metric' },

      { country_name: 'Ireland', currency: 'Euro', symbol: '€', iso: 'EUR', unit: 'Metric' },

      {
        country_name: 'Israel',
        currency: 'Israeli new shekel',
        symbol: '₪',
        iso: 'ILS',
        unit: 'Metric',
      },

      { country_name: 'Italy', currency: 'Euro', symbol: '€', iso: 'EUR', unit: 'Metric' },

      {
        country_name: 'Jamaica',
        currency: 'Jamaican dollar',
        symbol: '$',
        iso: 'JMD',
        unit: 'Metric',
      },

      { country_name: 'Japan', currency: 'Japanese yen', symbol: '円', iso: 'JPY', unit: 'Metric' },

      {
        country_name: 'Jordan',
        currency: 'Jordanian dinar',
        symbol: 'د.ا',
        iso: 'JOD',
        unit: 'Metric',
      },
      {
        country_name: 'Kazakhstan',
        currency: 'Kazakhstani tenge',
        symbol: '₸',
        iso: 'KZT',
        unit: 'Metric',
      },

      {
        country_name: 'Kenya',
        currency: 'Kenyan shilling',
        symbol: 'Sh',
        iso: 'KES',
        unit: 'Metric',
      },

      {
        country_name: 'Kiribati',
        currency: 'Kiribati dollar',
        symbol: '$',
        iso: 'KID[G]',
        unit: 'Metric',
      },

      {
        country_name: 'North Korea',
        currency: 'North Korean won',
        symbol: '₩',
        iso: 'KPW',
        unit: 'Metric',
      },

      {
        country_name: 'South Korea',
        currency: 'South Korean won',
        symbol: '₩',
        iso: 'KRW',
        unit: 'Metric',
      },

      { country_name: 'Kosovo', currency: 'Euro', symbol: '€', iso: 'EUR', unit: 'Metric' },

      {
        country_name: 'Kuwait',
        currency: 'Kuwaiti dinar',
        symbol: 'د.ك',
        iso: 'KWD',
        unit: 'Metric',
      },

      {
        country_name: 'Kyrgyzstan',
        currency: 'Kyrgyzstani som',
        symbol: 'с',
        iso: 'KGS',
        unit: 'Metric',
      },

      { country_name: 'Laos', currency: 'Lao kip', symbol: '₭', iso: 'LAK', unit: 'Metric' },

      { country_name: 'Latvia', currency: 'Euro', symbol: '€', iso: 'EUR', unit: 'Metric' },

      {
        country_name: 'Lebanon',
        currency: 'Lebanese pound',
        symbol: 'ل.ل',
        iso: 'LBP',
        unit: 'Metric',
      },

      {
        country_name: 'Lesotho',
        currency: 'Lesotho loti',
        symbol: 'L',
        iso: 'LSL',
        unit: 'Metric',
      },

      {
        country_name: 'Liberia',
        currency: 'Liberian dollar',
        symbol: '$',
        iso: 'LRD',
        unit: 'Metric',
      },

      {
        country_name: 'Libya',
        currency: 'Libyan dinar',
        symbol: 'ل.د',
        iso: 'LYD',
        unit: 'Metric',
      },

      {
        country_name: 'Liechtenstein',
        currency: 'Swiss franc',
        symbol: 'Fr.',
        iso: 'CHF',
        unit: 'Metric',
      },

      { country_name: 'Lithuania', currency: 'Euro', symbol: '€', iso: 'EUR', unit: 'Metric' },

      { country_name: 'Luxembourg', currency: 'Euro', symbol: '€', iso: 'EUR', unit: 'Metric' },

      {
        country_name: 'Macau',
        currency: 'Macanese pataca',
        symbol: 'P',
        iso: 'MOP',
        unit: 'Metric',
      },

      {
        country_name: 'Madagascar',
        currency: 'Malagasy ariary',
        symbol: 'Ar',
        iso: 'MGA',
        unit: 'Metric',
      },

      {
        country_name: 'Malawi',
        currency: 'Malawian kwacha',
        symbol: 'MK',
        iso: 'MWK',
        unit: 'Metric',
      },

      {
        country_name: 'Malaysia',
        currency: 'Malaysian ringgit',
        symbol: 'RM',
        iso: 'MYR',
        unit: 'Metric',
      },

      {
        country_name: 'Maldives',
        currency: 'Maldivian rufiyaa',
        symbol: '.ރ',
        iso: 'MVR',
        unit: 'Metric',
      },

      {
        country_name: 'Mali',
        currency: 'West African CFA franc',
        symbol: 'Fr',
        iso: 'XOF',
        unit: 'Metric',
      },

      { country_name: 'Malta', currency: 'Euro', symbol: '€', iso: 'EUR', unit: 'Metric' },

      {
        country_name: 'Marshall Islands',
        currency: 'United States dollar',
        symbol: '$',
        iso: 'USD',
        unit: 'Metric',
      },

      {
        country_name: 'Mauritania',
        currency: 'Mauritanian ouguiya',
        symbol: 'UM',
        iso: 'MRU',
        unit: 'Metric',
      },

      {
        country_name: 'Mauritius',
        currency: 'Mauritian rupee',
        symbol: '₨',
        iso: 'MUR',
        unit: 'Metric',
      },

      { country_name: 'Mexico', currency: 'Mexican peso', symbol: '$', iso: 'MXN', unit: 'Metric' },

      {
        country_name: 'Micronesia',
        currency: 'United States dollar',
        symbol: '$',
        iso: 'USD',
        unit: 'Metric',
      },

      {
        country_name: 'Moldova',
        currency: 'Moldovan leu',
        symbol: 'L',
        iso: 'MDL',
        unit: 'Metric',
      },

      { country_name: 'Monaco', currency: 'Euro', symbol: '€', iso: 'EUR', unit: 'Metric' },

      {
        country_name: 'Mongolia',
        currency: 'Mongolian tögrög',
        symbol: '₮',
        iso: 'MNT',
        unit: 'Metric',
      },

      { country_name: 'Montenegro', currency: 'Euro', symbol: '€', iso: 'EUR', unit: 'Metric' },

      {
        country_name: 'Montserrat',
        currency: 'Eastern Caribbean dollar',
        symbol: '$',
        iso: 'XCD',
        unit: 'Metric',
      },

      {
        country_name: 'Morocco',
        currency: 'Moroccan dirham',
        symbol: 'د.م.',
        iso: 'MAD',
        unit: 'Metric',
      },

      {
        country_name: 'Mozambique',
        currency: 'Mozambican metical',
        symbol: 'MT',
        iso: 'MZN',
        unit: 'Metric',
      },

      {
        country_name: 'Myanmar',
        currency: 'Burmese kyat',
        symbol: 'Ks',
        iso: 'MMK',
        unit: 'Metric',
      },

      {
        country_name: 'Namibia',
        currency: 'Namibian dollar',
        symbol: '$',
        iso: 'NAD',
        unit: 'Metric',
      },

      {
        country_name: 'Nauru',
        currency: 'Australian dollar',
        symbol: '$',
        iso: 'AUD',
        unit: 'Metric',
      },

      {
        country_name: 'Nepal',
        currency: 'Nepalese rupee',
        symbol: 'रू',
        iso: 'NPR',
        unit: 'Metric',
      },

      { country_name: 'Netherlands', currency: 'Euro', symbol: '€', iso: 'EUR', unit: 'Metric' },

      {
        country_name: 'New Caledonia',
        currency: 'CFP franc',
        symbol: '₣',
        iso: 'XPF',
        unit: 'Metric',
      },

      {
        country_name: 'New Zealand',
        currency: 'New Zealand dollar',
        symbol: '$',
        iso: 'NZD',
        unit: 'Metric',
      },

      {
        country_name: 'Nicaragua',
        currency: 'Nicaraguan córdoba',
        symbol: 'C$',
        iso: 'NIO',
        unit: 'Metric',
      },

      {
        country_name: 'Niger',
        currency: 'West African CFA franc',
        symbol: 'Fr',
        iso: 'XOF',
        unit: 'Metric',
      },

      {
        country_name: 'Nigeria',
        currency: 'Nigerian naira',
        symbol: '₦',
        iso: 'NGN',
        unit: 'Metric',
      },

      {
        country_name: 'Niue',
        currency: 'New Zealand dollar',
        symbol: '$',
        iso: 'NZD',
        unit: 'Metric',
      },

      {
        country_name: 'North Macedonia',
        currency: 'Macedonian denar',
        symbol: 'ден',
        iso: 'MKD',
        unit: 'Metric',
      },

      {
        country_name: 'Northern Cyprus',
        currency: 'Turkish lira',
        symbol: '₺',
        iso: 'TRY',
        unit: 'Metric',
      },

      {
        country_name: 'Norway',
        currency: 'Norwegian krone',
        symbol: 'kr',
        iso: 'NOK',
        unit: 'Metric',
      },

      { country_name: 'Oman', currency: 'Omani rial', symbol: 'ر.ع.', iso: 'OMR', unit: 'Metric' },

      {
        country_name: 'Pakistan',
        currency: 'Pakistani rupee',
        symbol: '₨',
        iso: 'PKR',
        unit: 'Metric',
      },

      {
        country_name: 'Palau',
        currency: 'United States dollar',
        symbol: '$',
        iso: 'USD',
        unit: 'Metric',
      },

      {
        country_name: 'Palestine',
        currency: 'Israeli new shekel',
        symbol: '₪',
        iso: 'ILS',
        unit: 'Metric',
      },

      {
        country_name: 'Panama',
        currency: 'Panamanian balboa',
        symbol: 'B/.',
        iso: 'PAB',
        unit: 'Metric',
      },

      {
        country_name: 'Papua New Guinea',
        currency: 'Papua New Guinean kina',
        symbol: 'K',
        iso: 'PGK',
        unit: 'Metric',
      },

      {
        country_name: 'Paraguay',
        currency: 'Paraguayan guaraní',
        symbol: '₲',
        iso: 'PYG',
        unit: 'Metric',
      },

      { country_name: 'Peru', currency: 'Peruvian sol', symbol: 'S/.', iso: 'PEN', unit: 'Metric' },

      {
        country_name: 'Philippines',
        currency: 'Philippine peso',
        symbol: '₱',
        iso: 'PHP',
        unit: 'Metric',
      },

      {
        country_name: 'Pitcairn Islands',
        currency: 'New Zealand dollar',
        symbol: '$',
        iso: 'NZD',
        unit: 'Metric',
      },

      {
        country_name: 'Poland',
        currency: 'Polish złoty',
        symbol: 'zł',
        iso: 'PLN',
        unit: 'Metric',
      },

      { country_name: 'Portugal', currency: 'Euro', symbol: '€', iso: 'EUR', unit: 'Metric' },

      {
        country_name: 'Qatar',
        currency: 'Qatari riyal',
        symbol: 'ر.ق',
        iso: 'QAR',
        unit: 'Metric',
      },

      {
        country_name: 'Romania',
        currency: 'Romanian leu',
        symbol: 'lei',
        iso: 'RON',
        unit: 'Metric',
      },

      {
        country_name: 'Russia',
        currency: 'Russian ruble',
        symbol: '₽',
        iso: 'RUB',
        unit: 'Metric',
      },

      {
        country_name: 'Rwanda',
        currency: 'Rwandan franc',
        symbol: 'Fr',
        iso: 'RWF',
        unit: 'Metric',
      },

      {
        country_name: 'Saint Helena',
        currency: 'Saint Helena pound',
        symbol: '£',
        iso: 'SHP',
        unit: 'Metric',
      },

      {
        country_name: 'Saint Kitts and Nevis',
        currency: 'Eastern Caribbean dollar',
        symbol: '$',
        iso: 'XCD',
        unit: 'Metric',
      },

      {
        country_name: 'Saint Lucia',
        currency: 'Eastern Caribbean dollar',
        symbol: '$',
        iso: 'XCD',
        unit: 'Metric',
      },

      {
        country_name: 'Saint Vincent and the Grenadines',
        currency: 'Eastern Caribbean dollar',
        symbol: '$',
        iso: 'XCD',
        unit: 'Metric',
      },

      { country_name: 'Samoa', currency: 'Samoan tālā', symbol: 'T', iso: 'WST', unit: 'Metric' },

      { country_name: 'San Marino', currency: 'Euro', symbol: '€', iso: 'EUR', unit: 'Metric' },

      {
        country_name: 'São Tomé and Príncipe',
        currency: 'São Tomé and Príncipe dobra',
        symbol: 'Db',
        iso: 'STN',
        unit: 'Metric',
      },

      {
        country_name: 'Saudi Arabia',
        currency: 'Saudi riyal',
        symbol: '﷼',
        iso: 'SAR',
        unit: 'Metric',
      },

      {
        country_name: 'Senegal',
        currency: 'West African CFA franc',
        symbol: 'Fr',
        iso: 'XOF',
        unit: 'Metric',
      },

      {
        country_name: 'Serbia',
        currency: 'Serbian dinar',
        symbol: 'дин.',
        iso: 'RSD',
        unit: 'Metric',
      },

      {
        country_name: 'Seychelles',
        currency: 'Seychellois rupee',
        symbol: '₨',
        iso: 'SCR',
        unit: 'Metric',
      },

      {
        country_name: 'Sierra Leone',
        currency: 'Sierra Leonean leone',
        symbol: 'Le',
        iso: 'SLL',
        unit: 'Metric',
      },

      {
        country_name: 'Singapore',
        currency: 'Singapore dollar',
        symbol: '$',
        iso: 'SGD',
        unit: 'Metric',
      },

      {
        country_name: 'Sint Eustatius',
        currency: 'United States dollar',
        symbol: '$',
        iso: 'USD',
        unit: 'Metric',
      },

      {
        country_name: 'Sint Maarten',
        currency: 'Netherlands Antillean guilder',
        symbol: 'ƒ',
        iso: 'ANG',
        unit: 'Metric',
      },

      { country_name: 'Slovakia', currency: 'Euro', symbol: '€', iso: 'EUR', unit: 'Metric' },

      { country_name: 'Slovenia', currency: 'Euro', symbol: '€', iso: 'EUR', unit: 'Metric' },

      {
        country_name: 'Solomon Islands',
        currency: 'Solomon Islands dollar',
        symbol: '$',
        iso: 'SBD',
        unit: 'Metric',
      },

      {
        country_name: 'Somalia',
        currency: 'Somali shilling',
        symbol: 'Sh',
        iso: 'SOS',
        unit: 'Metric',
      },

      {
        country_name: 'Somaliland',
        currency: 'Somaliland shilling',
        symbol: 'Sl',
        iso: 'SLS[G]',
        unit: 'Metric',
      },

      {
        country_name: 'South Africa',
        currency: 'South African rand',
        symbol: 'R',
        iso: 'ZAR',
        unit: 'Metric',
      },

      { country_name: 'Spain', currency: 'Euro', symbol: '€', iso: 'EUR', unit: 'Metric' },

      {
        country_name: 'South Sudan',
        currency: 'South Sudanese pound',
        symbol: '£',
        iso: 'SSP',
        unit: 'Metric',
      },

      {
        country_name: 'Sri Lanka',
        currency: 'Sri Lankan rupee',
        symbol: 'ரூ',
        iso: 'LKR',
        unit: 'Metric',
      },

      {
        country_name: 'Sudan',
        currency: 'Sudanese pound',
        symbol: 'ج.س.',
        iso: 'SDG',
        unit: 'Metric',
      },

      {
        country_name: 'Suriname',
        currency: 'Surinamese dollar',
        symbol: '$',
        iso: 'SRD',
        unit: 'Metric',
      },

      {
        country_name: 'Sweden',
        currency: 'Swedish krona',
        symbol: 'kr',
        iso: 'SEK',
        unit: 'Metric',
      },

      {
        country_name: 'Switzerland',
        currency: 'Swiss franc',
        symbol: 'Fr.',
        iso: 'CHF',
        unit: 'Metric',
      },

      {
        country_name: 'Syria',
        currency: 'Syrian pound',
        symbol: 'ل.س',
        iso: 'SYP',
        unit: 'Metric',
      },

      {
        country_name: 'Taiwan',
        currency: 'New Taiwan dollar',
        symbol: '$',
        iso: 'TWD',
        unit: 'Metric',
      },

      {
        country_name: 'Tajikistan',
        currency: 'Tajikistani somoni',
        symbol: 'ЅМ',
        iso: 'TJS',
        unit: 'Metric',
      },

      {
        country_name: 'Tanzania',
        currency: 'Tanzanian shilling',
        symbol: 'Sh',
        iso: 'TZS',
        unit: 'Metric',
      },

      { country_name: 'Thailand', currency: 'Thai baht', symbol: '฿', iso: 'THB', unit: 'Metric' },

      {
        country_name: 'Togo',
        currency: 'West African CFA franc',
        symbol: 'Fr',
        iso: 'XOF',
        unit: 'Metric',
      },

      {
        country_name: 'Tonga',
        currency: 'Tongan paʻanga',
        symbol: 'T$',
        iso: 'TOP',
        unit: 'Metric',
      },

      {
        country_name: 'Trinidad and Tobago',
        currency: 'Trinidad and Tobago dollar',
        symbol: 'р.',
        iso: 'TTD',
        unit: 'Metric',
      },

      {
        country_name: 'Tunisia',
        currency: 'Tunisian dinar',
        symbol: '$',
        iso: 'TND',
        unit: 'Metric',
      },

      {
        country_name: 'Turkey',
        currency: 'Turkish lira',
        symbol: 'د.ت',
        iso: 'TRY',
        unit: 'Metric',
      },

      {
        country_name: 'Turkmenistan',
        currency: 'Turkmenistan manat',
        symbol: '₺',
        iso: 'TMT',
        unit: 'Metric',
      },

      {
        country_name: 'Turks and Caicos Islands',
        currency: 'United States dollar',
        symbol: 'm',
        iso: 'USD',
        unit: 'Metric',
      },

      {
        country_name: 'Tuvalu',
        currency: 'Tuvaluan dollar',
        symbol: '$',
        iso: 'TVD[G]',
        unit: 'Metric',
      },

      {
        country_name: 'Uganda',
        currency: 'Ugandan shilling',
        symbol: 'Sh',
        iso: 'UGX',
        unit: 'Metric',
      },

      {
        country_name: 'Ukraine',
        currency: 'Ukrainian hryvnia',
        symbol: '₴',
        iso: 'UAH',
        unit: 'Metric',
      },

      {
        country_name: 'United Arab Emirates',
        currency: 'United Arab Emirates dirham',
        symbol: 'د.إ',
        iso: 'AED',
        unit: 'Metric',
      },

      {
        country_name: 'United Kingdom',
        currency: 'British pound',
        symbol: '£',
        iso: 'GBP',
        unit: 'Metric',
      },

      {
        country_name: 'United States',
        currency: 'United States dollar',
        symbol: '$',
        iso: 'USD',
        unit: 'Imperial',
      },

      {
        country_name: 'Uruguay',
        currency: 'Uruguayan peso',
        symbol: '$',
        iso: 'UYU',
        unit: 'Metric',
      },

      {
        country_name: 'Uzbekistan',
        currency: 'Uzbekistani soʻm',
        symbol: 'сўм',
        iso: 'UZS',
        unit: 'Metric',
      },

      {
        country_name: 'Vanuatu',
        currency: 'Vanuatu vatu',
        symbol: 'Vt',
        iso: 'VUV',
        unit: 'Metric',
      },

      { country_name: 'Vatican City', currency: 'Euro', symbol: '€', iso: 'EUR', unit: 'Metric' },

      {
        country_name: 'Venezuela',
        currency: 'Venezuelan bolívar soberano',
        symbol: 'Bs.',
        iso: 'VES',
        unit: 'Metric',
      },

      {
        country_name: 'Vietnam',
        currency: 'Vietnamese đồng',
        symbol: '₫',
        iso: 'VND',
        unit: 'Metric',
      },

      {
        country_name: 'Wallis and Futuna',
        currency: 'CFP franc',
        symbol: '₣',
        iso: 'XPF',
        unit: 'Metric',
      },

      { country_name: 'Yemen', currency: 'Yemeni rial', symbol: 'ر.ي', iso: 'YER', unit: 'Metric' },

      {
        country_name: 'Zambia',
        currency: 'Zambian kwacha',
        symbol: 'ZK',
        iso: 'ZMW',
        unit: 'Metric',
      },

      {
        country_name: 'Zimbabwe',
        currency: 'RTGS dollar',
        symbol: '(none)',
        iso: '(none)',
        unit: 'Metric',
      },
    ]),
  ]);
};

export const down = function (knex) {
  return Promise.all([knex('currency_table').del()]);
};
