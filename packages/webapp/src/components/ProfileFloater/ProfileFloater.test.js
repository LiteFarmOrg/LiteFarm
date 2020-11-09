import React from 'react';
import { render, fireEvent, screen, act } from '@testing-library/react'
import PureProfileFloater from "./index";

describe('Profile Loader View', () => {
  it('rendÎers correctly with given props', () => {
    const fakeFunc = jest.fn();
    render(<PureProfileFloater onSwitchFarm={fakeFunc} onInfo={fakeFunc} onHelp={fakeFunc} onLogout={fakeFunc}/>)
    expect(screen.queryByText(/log out/i)).toBeDefined();
  })

  it('calls all passed functions on click', () => {
    const fakeFunc = jest.fn();
    render(<PureProfileFloater onSwitchFarm={fakeFunc} onInfo={fakeFunc} onHelp={fakeFunc} onLogout={fakeFunc}/>)
    act(() => {
      fireEvent.click(screen.getByText(/log out/i));
      fireEvent.click(screen.getByText(/my info/i));
      fireEvent.click(screen.getByText(/switch farm/i));
      fireEvent.click(screen.getByText(/help/i));
    })
    expect(fakeFunc).toHaveBeenCalledTimes(4);
  })

})
