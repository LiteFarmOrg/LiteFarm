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

import React, { Component } from "react";
import styles from './styles.scss';
import { BsCaretLeft } from "react-icons/bs";

// takes 2 props
// title - String
// onBackButtonClick - Function triggered by back button click
class PageTitleFragment extends Component{

  render(){
    const title = this.props.title;
    return(
      <div>
        <div className={styles.titleContainer}>
          <button onClick={this.props.onBackButtonClick}>
            <BsCaretLeft></BsCaretLeft>
          </button>
          <div className={styles.titleTextContainer}>{title}</div>
        </div>
        <hr/>
      </div>
    )
  }

}

export default PageTitleFragment;
