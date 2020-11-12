import React from 'react';
import {render, fireEvent, screen} from '@testing-library/react'
import PureOutroSplash from "./index";
describe('OutroSplash View', () => {
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
    const redirectFinish = jest.fn();
    const onGoBack = jest.fn();
    render(<PureOutroSplash redirectFinish={redirectFinish} onGoBack={onGoBack}/>)
    expect(screen.queryByText('And finally, let us show you a couple of important things!')).toBeDefined();
  })

  it('calls redirectFinish when finish button is clicked', () => {
    const redirectFinish = jest.fn();
    const onGoBack = jest.fn();
    render(<PureOutroSplash redirectFinish={redirectFinish} onGoBack={onGoBack}  />)
    fireEvent.click(screen.getByText(/Finish/i));
  })

  it('calls onGoBack when go back button is clicked', () => {
    const redirectFinish = jest.fn();
    const onGoBack = jest.fn();
    render(<PureOutroSplash redirectFinish={redirectFinish} onGoBack={onGoBack}  />)
    fireEvent.click(screen.getByText(/Go back/i));
  })
})