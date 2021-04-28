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

import React from 'react';
import { withTranslation } from 'react-i18next';
import Button from '../Form/Button';

class LogFooter extends React.Component {
  render() {
    const { onClick, edit } = this.props;

    return (
      <>
        <div style={{ flexGrow: 1 }} />
        <div style={{ padding: '24px 0', display: 'inline-flex', gap: '8px', width: '100%' }}>
          {edit && (
            <Button style={{ margin: 0 }} color={'secondary'} fullLength onClick={onClick}>
              {this.props.t('common:DELETE')}
            </Button>
          )}

          <Button style={{ margin: 0 }} fullLength>
            {edit ? this.props.t('common:UPDATE') : this.props.t('common:SAVE')}
          </Button>
        </div>
      </>
    );
  }
}

export default withTranslation()(LogFooter);
