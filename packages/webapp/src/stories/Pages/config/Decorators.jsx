import { useState } from 'react';
import { Router } from 'react-router-dom';
import history from '../../../history';
import { NavMenuControlsContext } from '../../../App';
import Navigation from '../../../containers/Navigation';

const setIdToken = () => {
  if (!localStorage.getItem('id_token')) {
    localStorage.setItem('id_token', 'id_token');
  }
};

export default [
  (story) => {
    const [isFeedbackSurveyOpen, setFeedbackSurveyOpen] = useState(false);
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
        <NavMenuControlsContext.Provider
          value={{
            feedback: { isFeedbackSurveyOpen, setFeedbackSurveyOpen },
          }}
        >
          <Navigation />
        </NavMenuControlsContext.Provider>
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
    const [isFeedbackSurveyOpen, setFeedbackSurveyOpen] = useState(false);
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
        <NavMenuControlsContext.Provider
          value={{
            feedback: { isFeedbackSurveyOpen, setFeedbackSurveyOpen },
          }}
        >
          <Navigation />
        </NavMenuControlsContext.Provider>
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
      <Router history={history}>
        <div style={{ padding: '24px' }}>
          <div style={{ background: '#F6FBFA', padding: 10 }}>{story()}</div>
        </div>
      </Router>
    );
  },
];

export const navMenuControlDecorator = [
  (story) => {
    const [isFeedbackSurveyOpen, setFeedbackSurveyOpen] = useState(false);
    return (
      <NavMenuControlsContext.Provider
        value={{
          feedback: { isFeedbackSurveyOpen, setFeedbackSurveyOpen },
        }}
      >
        {story()}
      </NavMenuControlsContext.Provider>
    );
  },
];
