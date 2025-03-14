/*
 *  Copyright 2025 LiteFarm.org
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

import 'react';

declare module 'react' {
  interface HTMLAttributes<T> extends DOMAttributes<T> {
    /**
     * Boolean attribute indicating that the browser will ignore the element.
     *
     * Use empty string or null to set the correct DOM attribute e.g.
     *
     *   inert={!isDisabled ? '' : null}
     *
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/inert}
     *
     *@see {@link https://github.com/WICG/inert/issues/58}
     */
    inert?: '' | null;
  }
}
