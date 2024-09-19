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
