import React from 'react';
import Auth from '../../Auth/Auth';
import Home from '../../stories/Pages/Home'
//TODO delete this wrapper once auth0 bug is fixed
export default function () {
  const auth = new Auth();
  return <Home auth={auth}/>
}
