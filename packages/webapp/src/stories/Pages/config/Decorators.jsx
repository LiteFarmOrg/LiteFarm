import React from 'react';
import { Router } from 'react-router';
import history from '../../../history';
import Navigation from '../../../containers/Navigation';

const setIdToken = () => {
  if (!localStorage.getItem('id_token')) {
    localStorage.setItem('id_token', 'id_token');
  }
};

export default [
  (story) => {
    setIdToken();
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <Navigation history={history} />
        <div
          className="app"
          style={{
            width: '100%',
            maxWidth: '1024px',
            flex: '1',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {story()}
        </div>
      </div>
    );
  },
];

export const authenticatedDecorators = [
  (story) => {
    setIdToken();
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <Navigation history={history} />
        <div
          className="app"
          style={{
            width: '100%',
            maxWidth: '1024px',
            flex: '1',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {story()}
        </div>
      </div>
    );
  },
];

export const decoratorsWithStore = [
  (story) => {
    return (
      <Router history={history}>
        <div style={{ padding: '24px' }}>{story()}</div>
      </Router>
    );
  },
];

export const componentDecorators = [
  (story) => {
    return <div style={{ padding: '24px' }}>{story()}</div>;
  },
];

export const componentDecoratorsGreyBackground = [
  (story) => {
    return <div style={{ padding: '24px', backgroundColor: 'gray' }}>{story()}</div>;
  },
];

export const componentDecoratorsWithoutPadding = [
  (story) => {
    return story();
  },
];

export const componentDecoratorsFullHeight = [
  (story) => {
    return <div style={{ height: '100vh' }}>{story()}</div>;
  },
];

export const v2TableDecorator = [
  (story) => {
    return (
      <div style={{ padding: '24px' }}>
        <div style={{ background: '#F6FBFA', padding: 10 }}>{story()}</div>
      </div>
    );
  },
];
