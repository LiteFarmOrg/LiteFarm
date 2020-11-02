/* 
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>   
 *  This file (components.test.js) is part of LiteFarm.
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

import React from 'react';
import Enzyme, {shallow} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

import {Button} from 'react-bootstrap';
import InfoBoxComponent from "../../components/InfoBoxComponent";
import InsightsInfoComponent from "../../components/Insights/InsightsInfoComponent";
import {ProgressBar} from "react-bootstrap";

Enzyme.configure({ adapter: new Adapter() });

describe('Info Box Component Tests', () => {
  const showSave = true;
  const saveHandler = jest.fn();

  const showDelete = true;
  const deleteHandler = jest.fn();
  let wrapper;

  // onSubmit, title, inputs, inputClasses = '',  redirectConsent

  beforeEach(() => {
    wrapper = shallow(
      <InfoBoxComponent
        showSave = {showSave}
        saveHandler = {saveHandler}
        showDelete = {showDelete}
        deleteHandler = {deleteHandler}
      />
    )
  });

  afterEach(() => {
    saveHandler.mockReset();
    deleteHandler.mockReset();
  });

  it('Info Box With No Save Button Shown', () => {
    wrapper.setProps({ showSave: false });
    expect(wrapper.find(Button).length).toBe(2);
  });

  it('Info Box with No Delete Button Shown', () => {
    wrapper.setProps({ showDelete: false });
    expect(wrapper.find(Button).length).toBe(2);
  });

  it('Info Box with Both Save and Delete Shown', () => {
    expect(wrapper.find(Button).length).toBe(3);
  });

  it('Info Box Save Handler Simulate Function', () => {
    const x = saveHandler();
    expect(x).toBeUndefined();
    expect(saveHandler).toHaveBeenCalledTimes(1);
  });


  it('Info Box Delete Handler Simulate Function', () => {
    const x = deleteHandler();
    expect(x).toBeUndefined();
    expect(deleteHandler).toHaveBeenCalledTimes(1);
  })

});

describe('People Fed Info Component Tests', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = shallow(
      <InsightsInfoComponent/>
    )
  });

  it('Feeding in Percent Should display it in my ProgressBar Props', () => {
    const progress = 12;
    wrapper.setProps({ percent: progress });
    expect(wrapper.find(ProgressBar).prop("now")).toBe(12);
  })

});

