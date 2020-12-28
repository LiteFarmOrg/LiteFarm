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
import history from '../../history';
import InfoBoxComponent from '../InfoBoxComponent';
import { BsChevronLeft } from 'react-icons/bs';

// takes 2 props
// title - String
// backUrl - String, e.g. '/log'
class PageTitle extends Component {
  render() {
    const title = this.props.title;
    const backUrl = this.props.backUrl;
    const rightIcon = this.props.rightIcon;
    const rightIconTitle = this.props.rightIconTitle;
    const rightIconBody = this.props.rightIconBody;
    const rightIconDeleteHandler = this.props.rightIconDeleteHandler;
    const showDelete = this.props.showDelete;
    return (
      <div>
        <div className={styles.titleContainer}>
          <button
            className={styles.buttonContainer}
            onClick={() => {
              history.push(backUrl);
            }}
          >
            <BsChevronLeft />
          </button>
          <div className={styles.titleTextContainer}>{title}</div>
          {rightIcon && (
            <div>
              <InfoBoxComponent
                title={rightIconTitle}
                body={rightIconBody}
                deleteHandler={rightIconDeleteHandler}
                showDelete={showDelete}
              />
            </div>
          )}
        </div>
        <hr />
      </div>
    );
  }
}

export default PageTitle;
