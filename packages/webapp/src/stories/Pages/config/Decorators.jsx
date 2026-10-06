import { useState } from 'react';
import Navigation from '../../../containers/Navigation';
import { AppUIContext } from '../../../contexts/appContext';

const setIdToken = () => {
  if (!localStorage.getItem('id_token')) {
    localStorage.setItem('id_token', 'id_token');
  }
};

export default [
  (story) => {
    const [activeDrawer, setActiveDrawer] = useState(null);
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
        <AppUIContext.Provider
          value={{
            activeDrawer,
            setActiveDrawer,
            maps: { isLoaded: true },
          }}
        >
          <Navigation />
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
        </AppUIContext.Provider>
      </div>
    );
  },
];

export const authenticatedDecorators = [
  (story) => {
    const [activeDrawer, setActiveDrawer] = useState(null);
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
        <AppUIContext.Provider
          value={{
            activeDrawer,
            setActiveDrawer,
            maps: { isLoaded: true },
          }}
        >
          <Navigation />
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
        </AppUIContext.Provider>
      </div>
    );
  },
];

export const decoratorsWithStore = [
  (story) => {
    return <div style={{ padding: '24px' }}>{story()}</div>;
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

export const navMenuControlDecorator = [
  (story) => {
    const [activeDrawer, setActiveDrawer] = useState(null);
    return (
      <AppUIContext.Provider
        value={{
          activeDrawer,
          setActiveDrawer,
        }}
      >
        {story()}
      </AppUIContext.Provider>
    );
  },
];
