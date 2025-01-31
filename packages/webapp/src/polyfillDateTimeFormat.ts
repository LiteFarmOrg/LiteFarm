/*
 *  Copyright 2024 LiteFarm.org
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

// We are polyfilling because Chrome desktop has incomplete support for some of the languages (even if in theory they are supported)
// Once Chrome starts returning the right thing these imports (and the package) should be removed
import '@formatjs/intl-datetimeformat/polyfill-force';
import '@formatjs/intl-datetimeformat/add-all-tz';
import '@formatjs/intl-datetimeformat/locale-data/en';
import '@formatjs/intl-datetimeformat/locale-data/es';
import '@formatjs/intl-datetimeformat/locale-data/fr';
import '@formatjs/intl-datetimeformat/locale-data/pt';
import '@formatjs/intl-datetimeformat/locale-data/de';
import '@formatjs/intl-datetimeformat/locale-data/pa';
import '@formatjs/intl-datetimeformat/locale-data/hi';
import '@formatjs/intl-datetimeformat/locale-data/ml';
