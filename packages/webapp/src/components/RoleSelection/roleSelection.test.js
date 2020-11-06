import React from 'react';
import {render, fireEvent, screen} from '@testing-library/react'
import PureRoleSelection from "./index";
describe('RoleSelection View', () => {
  beforeAll(() => {
    // To get rid of useless error message until better solution
    // https://github.com/jsdom/jsdom/issues/1937
    const tempErrorFn = console.error;
    console.error = (message, optionalParams) => {
      if(!message.includes('Not implemented')){
        tempErrorFn(message, optionalParams);
      }
    }
  })
  it('renders correctly with given props', () => {
    const mockSubmit = jest.fn();
    const redirectConsent = jest.fn();
    render(<PureRoleSelection onSubmit={mockSubmit} title={'What is your role on the farm?'} inputs={[]} redirectConsent={redirectConsent}/>)
    expect(screen.queryByText('What is your role on the farm?')).toBeDefined();
  })

  it('calls on submit when continue button is clicked', () => {
    const mockSubmit = jest.fn();
    const redirectConsent = jest.fn();
    render(<PureRoleSelection onSubmit={mockSubmit} title={'What is your role on the farm?'} inputs={{}} redirectConsent={redirectConsent} />)
    fireEvent.click(screen.getByText(/continue/i));
    expect(mockSubmit).toHaveBeenCalled();
  })
})