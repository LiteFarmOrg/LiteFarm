import React from 'react';
import { render, fireEvent, screen, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import PureProfileFloater from '../../components/ProfileFloater';

describe('Profile Floater Container', () => {

  it('should render properly', () => {
    render(<PureProfileFloater><a>Test</a></PureProfileFloater>);
    expect(screen.getByText(/test/i)).toBeDefined();
  })

  it('should call logout on logout click', () => {
    const logout = jest.fn();
    render(<PureProfileFloater auth={{ logout }}><a>test</a></PureProfileFloater>);
    act(() => {
      fireEvent.click(screen.getByText(/test/i));
    });
    expect(screen.getByText(/log out/i)).toBeDefined();
    act(() => {
      fireEvent.click(screen.getByText(/log out/i));
    })
    expect(logout).toHaveBeenCalled();
  })

})
