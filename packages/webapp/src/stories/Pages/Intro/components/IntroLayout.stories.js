import React from 'react';
import Layout from './';
import Button from '../../Button';
import Svg from './Svg';
import signup2 from '../../../assets/signUp/signUp2.svg';
import { Provider } from "react-redux";
import { Router } from "react-router-dom";
import history from "../../../history";
import { action } from "@storybook/addon-actions";

const store = {
  getState: () => {
    return {
      baseReducer: {
        users: {
          first_name: 'Fake',
          last_name: 'User',
          email: 'email@test.com',
          user_id: '221242323',
        }, farm: {
          has_consent: true
        }}
    };
  },
  subscribe: () => 0,
  dispatch: action('dispatch'),
};


export default {
  title: 'Layout/Intro',
  decorators: [story =>
    <Provider store={store}>
      <Router history={history}>
        {story()}
      </Router>
    </Provider>],
  component: Layout,
};

const Template = (args) => <Layout {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  auth: {logout: () => {}, isAuthenticated: () => false},
  buttonGroup: (<Button fullLength/>),
};

export const SVG = Template.bind({});
SVG.args = {
  buttonGroup: (<Button fullLength/>),
  children: <Svg svg={signup2} alt={'Welcome to LiteFarm'}/>,
  isSVG: true,
  auth: {logout: () => {}, isAuthenticated: () => false},
};

export const TwoButton = Template.bind({});
TwoButton.args = {
  buttonGroup: (<><Button fullLength/><Button fullLength/></>),
};