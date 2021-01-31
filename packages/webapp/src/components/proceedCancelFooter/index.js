/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (index.js) is part of LiteFarm.
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

import React, { Component } from 'react';
import styles from './styles.scss';

//requires 2 props
// cancelFunc
// proceedFunc
// option props: cancelText, proceedText, disableProceed
class ProceedFooter extends Component {
  render() {
    const cText = typeof this.props.cancelText === 'string' ? this.props.cancelText : 'Cancel';
    const pText = typeof this.props.proceedText === 'string' ? this.props.proceedText : 'Proceed';
    let isDisabled = false;
    if (typeof this.props.disableProceed === 'boolean') {
      isDisabled = this.props.disableProceed;
    }

    return (
      <div className={styles.footerContainer}>
        <button onClick={() => this.props.cancelFunc()}>{cText}</button>
        <button
          className={styles.pButton}
          onClick={() => this.props.proceedFunc()}
          disabled={isDisabled}
        >
          {pText}
        </button>
      </div>
    );
  }
}
export default ProceedFooter;
