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

class App extends Component {
  render() {
    const auth = new Auth();
    return (
      <>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight:'100vh' }}>
          <NavBar auth={auth} history={history}/>
          <div className="app" style={{ width: '100%', maxWidth: '1024px', flex: '1', display: 'flex', flexDirection: 'column' }}>
            <Routes/>
          </div>
        </div>
      </>
    );
  }
}

export default App;