import React from 'react';
import { render, fireEvent, screen, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import ProfileFloater from "./index";

describe('Profile Floater Container', () => {

  it('should render properly', () => {
    render(<ProfileFloater><a>Test</a></ProfileFloater>);
    expect(screen.getByText(/test/i)).toBeDefined();
  })

  it('should call logout on logout click', () => {
    const logout = jest.fn();
    render(<ProfileFloater auth={{ logout }}><a>test</a></ProfileFloater>);
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
