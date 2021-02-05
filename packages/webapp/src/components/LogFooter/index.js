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

import history from '../../history';
import React from 'react';
import styles from './styles.scss';
import { withTranslation } from 'react-i18next';

class LogFooter extends React.Component {
  render() {
    const { onClick, edit, isHarvestLog } = this.props;
    let url = isHarvestLog ? '/harvest_use_types' : '/new_log';

    return (
      <div className={styles.bottomContainer}>
        {edit ? (
          <div className={styles.cancelButton} onClick={onClick}>
            {this.props.t('common:DELETE')}
          </div>
        ) : (
          <div className={styles.cancelButton} onClick={() => history.push(url)}>
            {this.props.t('common:CANCEL')}
          </div>
        )}
        <div className={styles.cancelButton}>
          <button className="btn btn-primary">
            {isHarvestLog ? this.props.t('common:NEXT') : this.props.t('common:SAVE')}
          </button>
        </div>
      </div>
    );
  }
}

export default withTranslation()(LogFooter);
