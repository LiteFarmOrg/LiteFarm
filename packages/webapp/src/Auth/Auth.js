/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (Auth.js) is part of LiteFarm.
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

import auth0 from 'auth0-js';
import history from '../history';
import apiConfig from '../apiConfig';
import { purgeState } from '../index';
import { getCurrentRootURI } from '../util';
const axios = require('axios');
const url  = require('url');

const REACT_APP_ENV = process.env.REACT_APP_ENV || 'development';
const NODE_ENV = process.env.NODE_ENV || "development";
// gets current root URI
const currentURI = getCurrentRootURI();

let domain;
let audience;
let auth0Uri;
let authorizationAdminRoleId;
let authorizationWorkerId;
let logoutUri;
const clientID = process.env.REACT_APP_AUTH0_CLIENT_ID;
const authExtensionClientId = process.env.REACT_APP_AUTH0_AUTH_EXTENSION_CLIENT_ID;
const authExtensionClientSecret = process.env.REACT_APP_AUTH0_AUTH_EXTENSION_CLIENT_SECRET;
const authorizationExtensionUri = process.env.REACT_APP_AUTH0_AUTH_EXTENSION_URI;
const redirectUri = `${currentURI}/callback`;

if (NODE_ENV === 'development') {
   domain = 'litefarm-dev.auth0.com';
   audience = 'https://litefarm-dev.auth0.com/userinfo';
   auth0Uri = 'https://litefarm-dev.auth0.com';
   authorizationAdminRoleId = '965b1e18-eb91-4def-a166-58e5f54ee2dc';
   authorizationWorkerId = 'e225a28d-5caa-491b-91e3-70b55f5c1558';
   logoutUri = 'http%3A%2F%2Flocalhost:3000';
} else if (NODE_ENV === 'production') {
  if (REACT_APP_ENV === 'integration') {
    domain = 'litefarm.auth0.com';
    audience = 'https://litefarm.auth0.com/userinfo';
    auth0Uri = 'https://litefarm.auth0.com';
    authorizationAdminRoleId = "413c8fa8-35a5-4caa-92d7-8a76babf44da";
    authorizationWorkerId = 'a9006f4a-e59d-4e19-b28c-f757107c7a04';
    //logoutUri = 'https%3A%2F%2Flitefarm-webapp-integration.herokuapp.com';
    logoutUri = 'https%3A%2F%2Fbeta.litefarm.org';
  }
  if (REACT_APP_ENV === 'production') {
    domain = 'litefarm-production.auth0.com';
    audience = 'https://litefarm-production.auth0.com/userinfo';
    auth0Uri = 'https://litefarm-production.auth0.com';
    authorizationAdminRoleId = "8f53c7bd-4ac4-42a4-b581-ea2aef0e4ece";
    authorizationWorkerId = '36456d3b-654b-452c-8d6e-cbf3a2e6cbca';
    logoutUri = 'https%3A%2F%2Fwww.litefarm.org';
  }
}

console.log(`auth0 callback url set to ${redirectUri}, NODE_ENV set to ${process.env.NODE_ENV}, REACT_APP_ENV set to ${REACT_APP_ENV}`);
const authConfig = {
  domain,
  clientID,
  redirectUri,
  audience,
  responseType: 'token id_token',
  scope: 'openid profile permissions user_metadata app_metadata'
};

class Auth {
  auth0 = new auth0.WebAuth(authConfig);

  constructor() {
    // functions from auth0
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.handleAuthentication = this.handleAuthentication.bind(this);
    this.isAuthenticated = this.isAuthenticated.bind(this);
    // function added by us
    this.postUserToLiteFarmDB = this.postUserToLiteFarmDB.bind(this);
    this.getUserInfo = this.getUserInfo.bind(this);
    this.setUserProfilePic = this.setUserProfilePic.bind(this);
    this.getAPIExplorerToken = this.getAPIExplorerToken.bind(this);
    this.setUserRoleInAuth0 = this.setUserRoleInAuth0.bind(this);
    this.postUserIfNotExists = this.postUserIfNotExists.bind(this);
  }


  login() {
    this.auth0.authorize({});
  }

  async logout() {
    // navigate to the home route
    history.push('/home');
    window.location.href = `${auth0Uri}/v2/logout?returnTo=${logoutUri}`;
    // Clear Access Token and ID Token from local storage
    purgeState();
    localStorage.clear();
  }

  isAuthenticated() {
    // Check whether the current time is past the Access Token's expiry time
    let expiresAt = JSON.parse(localStorage.getItem('expires_at'));
    const authenticated = new Date().getTime() < expiresAt;
    if (!authenticated) {
      purgeState();
    }
    return authenticated;
  }

  handleAuthentication() {
    this.auth0.parseHash((err, authResult) => {
      if (authResult && authResult.accessToken && authResult.idToken) {
        this.setSession(authResult);
      } else if (err) {
        history.push('/home');
        console.log(err);
      }
    });
  }

  setSession(authResult) {
    // Set the time that the Access Token will expire at
    //console.log(authResult);
    localStorage.removeItem('access_token');
    localStorage.removeItem('id_token');
    localStorage.removeItem('expires_at');
    let expiresAt = JSON.stringify((authResult.expiresIn * 1000) + new Date().getTime());
    localStorage.setItem('access_token', authResult.accessToken);
    localStorage.setItem('id_token', authResult.idToken);
    localStorage.setItem('expires_at', expiresAt);
    //navigate to home route
    this.getUserInfo(authResult.accessToken, authResult.idToken);
  }

  //add the user to lite farm's users table
  async postUserToLiteFarmDB(user_id, user_info, idToken) {
    let header = {
      headers: {
        'Authorization': 'Bearer ' + idToken,
        'Content-Type': 'application/json'
      },
    };

    let namespace = 'https://litefarm:auth0:com/';
    let userMetaKey = namespace + 'user_metadata';
    let appMetaKey = namespace + 'app_metadata';


    // check if auth0 sent meta data
    if(!(user_info.hasOwnProperty(userMetaKey)) || !(user_info.hasOwnProperty(appMetaKey))){
      alert('missing meta data for user');
      return;
    }
    let user_metadata = user_info[userMetaKey];
    let app_metadata = user_info[appMetaKey];

    // verify if all properties exist before posting
    if(!(user_metadata.first_name || user_info.given_name) || !(user_metadata.last_name || user_info.family_name) || !user_info.name || !user_info.picture){
      alert('an error has occurred during sign-up, please contact LiteFarm for assistance');
      throw new Error("missing metadata properties");
    }

    const email = user_info.sub.split('|')[0] === 'google-oauth2' ? user_info.nickname + "gmail.com" : user_info.name;
    let first_name = user_metadata.first_name || user_info.given_name;
    let last_name = user_metadata.last_name || user_info.family_name;
    let user_url = apiConfig.userUrl;
    let url_parts = url.parse(user_info.picture, true);
    let query = url_parts.query;
    let picUrl = '';
    if(query.d){
      picUrl = query.d;
    }
    let data = {
      user_id : user_id,
      first_name: first_name,
      last_name: last_name,
      email,
      profile_picture: picUrl,
    };

    // post new user to db
    axios.get(apiConfig.userUrl + '/' + user_id, {
      validateStatus: function (status) {
        return status < 500; // Reject only if the status code is greater than or equal to 500
      },
      headers: {
        'Authorization': 'Bearer ' + idToken,
        'Content-Type': 'application/json'
      },
    }).then((response) => {
      // check if signed up field is in app metadata
      if(!app_metadata.hasOwnProperty('signed_up')){
        alert('missing signed up value');
      }
      // if user signed up then don't post to DB;
      else if(app_metadata.signed_up && (response.status === 200 || response.status === 201)){
        console.log(response)
        this.setUserProfilePic().then(() => {
          if(response.data[0].farm_id){
            history.push('/farm_selection');
          } else {
            history.push('/add_farm')
          }
        }).catch((err) => {
          console.error(err);
        });
      } else {
        return this.postUserIfNotExists(user_url, data, header, app_metadata).then(() => {
          // we are going to be using the authorization extension API in auth0 to set the user role to admin
          // first we need to obtain a token to access the authorization extension API
          // the token can be obtained from the API Explorer application
          // once the token is obtained, it can be used to set the user role using the authorization extension API
          return this.getAPIExplorerToken();
        }).then((response) => {
          // set users role to admin in auth0
            //return this.setUserRoleInAuth0(user_info.sub, response.data.access_token, is_adminn);
        }).then(() => {
          // retrieve fresh token which is updated with new role and set new session
          this.auth0.checkSession(authConfig, (err, authResult) => {
            if (authResult && authResult.accessToken && authResult.idToken) {
              let expiresAt = JSON.stringify((authResult.expiresIn * 1000) + new Date().getTime());
              localStorage.setItem('access_token', authResult.accessToken);
              localStorage.setItem('id_token', authResult.idToken);
              localStorage.setItem('expires_at', expiresAt);
            } else if (err) {
              console.log(err);
              return this.logout();
            }
          });
        }).then(()=>{
          // alert('posted to user table!');
          if (!app_metadata.emailInvite) {
            history.push('/add_farm');
          } else {
            // users invited through email don't need to add farm
            return this.setUserProfilePic().then(() => {
              history.push('/intro')
            })
          }
        })
      }
    }).catch((err) =>{
      alert('an error has occurred during log-in, please try logging in again');
      alert(err);
      console.error(err);
      return this.logout();
    });
  }

  // get user info from auth0
  getUserInfo(accessToken, idToken){
    let header = {
      headers: {
        'Authorization': 'Bearer ' + accessToken,
        'Content-Type': 'application/json'
      },
    };

    axios.get(`${auth0Uri}/userinfo`, header).then((result) =>{
      let user_id;
      // check if data exist
      localStorage.removeItem('user_id');
      if(result.data.sub){
        if(result.data.sub.includes('|')){
          // user_id is in the form of auth0|id
          user_id = result.data.sub.split("|")[1];
          localStorage.setItem('user_id', user_id);

          return this.postUserToLiteFarmDB(user_id, result.data, idToken);
        }
        else{
          alert('failed to retrieve user id, please contact lite farm');
        }
      }
      else{
        alert('failed to retrieve user id, please contact lite farm');
      }

    }).catch((err) => {
      console.error(err);
    });
  }

  // need to retrieve token from API Explorer in order to access authentication extension API
  async getAPIExplorerToken() {
    const url = `${auth0Uri}/oauth/token`;
    const header = {
      headers: {
        'Content-Type': 'application/json'
      },
    };
    const data = {
      client_id: authExtensionClientId,
      client_secret: authExtensionClientSecret,
      audience:"urn:auth0-authz-api",
      grant_type:"client_credentials"
    };
    return await axios.post(url, data, header);
  }

  // set a users role in auth0
  async setUserRoleInAuth0(user_id, token, is_admin=true) {
    //   curl --request PATCH \
    // --url 'https://litefarm.us.webtask.io/adf6e2f2b84784b57522e3b19dfc9201/api/roles' \
    // --header 'Authorization: Bearer {token}'
    const url = `${authorizationExtensionUri}/api/users/${user_id}/roles`;
    const header = {
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      },
    };

    const roles = is_admin ? [ authorizationAdminRoleId ] : [ authorizationWorkerId ];
    return await axios.patch(url, roles, header);
  }

  // delete a users role in auth0
  async deleteUserRoleInAuth0(user_id, token, is_admin=true) {
    //   curl --request DELETE \
    // --url 'https://litefarm.us.webtask.io/adf6e2f2b84784b57522e3b19dfc9201/api/roles' \
    // --header 'Authorization: Bearer {token}'
    const url = `${authorizationExtensionUri}/api/users/${user_id}/roles`;
    const roles = is_admin ? [ authorizationWorkerId ] : [ authorizationAdminRoleId ];
    const config = {
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      },
      data: roles
    };

    return await axios.delete(url, config);
  }

  async setUserProfilePic(){
    let user_id = localStorage.getItem('user_id');
    let token = localStorage.getItem('id_token');
    let header = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token,
      },
    };
    axios.get(apiConfig.userUrl + '/' + user_id, header).then((res) => {
      if(res.data && res.data[0].profile_picture){
        localStorage.setItem('profile_picture', res.data[0].profile_picture);
      }
    })
  }

  postUserIfNotExists(user_url, data, header, app_metadata) {
    return new Promise((resolve, reject) => {
      if (!app_metadata.emailInvite) {
        axios.post(user_url, data, header).then((result) => {
          resolve(result);
        }).catch((e) => {
          reject(e);
        })
      } else {
        resolve();
      }
    });
  }
}

export default Auth;
