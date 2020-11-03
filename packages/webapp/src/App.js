/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (App.js) is part of LiteFarm.
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
import NavBar from './containers/Navigation';
import history from './history';
import Routes from './Routes.js';
import Auth from './Auth/Auth.js';
import ReactJoyride from 'react-joyride';

class App extends Component {
  state = {
    steps: [
      {
        target: ".selector h3",
        content: "This is your message to your user"
      }
    ]
  }
  render() {
    const auth = new Auth();
    console.log("we are in app...")
    console.log(this.state.steps)
    return (
      <div className="app" style={{width:'100%', maxWidth: '1024px'}}>
        <NavBar auth={auth} steps={this.state.steps} history={history}/>
        <ReactJoyride
          steps={this.state.steps}
        />
        <div className="rederToDOM">
          <div className="selector">
            <h3>Hi! I am an h3.</h3>
          </div>
        </div>
        <Routes />
      </div>
    );
  }
}

export default App;
